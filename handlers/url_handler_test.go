package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"gin-url-shortener/config"
	"gin-url-shortener/models"
	"gin-url-shortener/services"
	"gin-url-shortener/storage"
)

func setupTestRouter() (*gin.Engine, *URLHandler) {
	gin.SetMode(gin.TestMode)
	
	memStorage := storage.NewMemoryStorage()
	cfg := &config.Config{
		BaseURL: "http://localhost:8080",
	}
	urlService := services.NewURLService(memStorage, cfg)
	urlHandler := NewURLHandler(urlService)
	
	router := gin.New()
	router.POST("/shorten", urlHandler.ShortenURL)
	router.GET("/:shortCode", urlHandler.RedirectURL)
	router.GET("/info/:shortCode", urlHandler.GetURLInfo)
	router.GET("/health", urlHandler.HealthCheck)
	
	return router, urlHandler
}

func TestURLHandler_ShortenURL(t *testing.T) {
	router, _ := setupTestRouter()

	t.Run("Valid request", func(t *testing.T) {
		reqBody := models.ShortenRequest{
			URL: "https://www.example.com",
		}
		jsonBody, _ := json.Marshal(reqBody)
		
		req, _ := http.NewRequest("POST", "/shorten", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		assert.Equal(t, http.StatusCreated, w.Code)
		
		var response models.ShortenResponse
		err := json.Unmarshal(w.Body.Bytes(), &response)
		require.NoError(t, err)
		
		assert.NotEmpty(t, response.ShortCode)
		assert.Equal(t, "https://www.example.com", response.OriginalURL)
		assert.Contains(t, response.ShortURL, response.ShortCode)
	})

	t.Run("Invalid JSON", func(t *testing.T) {
		req, _ := http.NewRequest("POST", "/shorten", bytes.NewBuffer([]byte("invalid json")))
		req.Header.Set("Content-Type", "application/json")
		
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		assert.Equal(t, http.StatusBadRequest, w.Code)
		
		var errorResp models.ErrorResponse
		err := json.Unmarshal(w.Body.Bytes(), &errorResp)
		require.NoError(t, err)
		assert.Equal(t, "invalid_request", errorResp.Error)
	})

	t.Run("Missing URL", func(t *testing.T) {
		reqBody := models.ShortenRequest{}
		jsonBody, _ := json.Marshal(reqBody)
		
		req, _ := http.NewRequest("POST", "/shorten", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

func TestURLHandler_RedirectURL(t *testing.T) {
	router, _ := setupTestRouter()

	t.Run("Valid short code", func(t *testing.T) {
		// 先创建一个短链接
		reqBody := models.ShortenRequest{
			URL: "https://www.example.com",
		}
		jsonBody, _ := json.Marshal(reqBody)
		
		req, _ := http.NewRequest("POST", "/shorten", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		var response models.ShortenResponse
		json.Unmarshal(w.Body.Bytes(), &response)
		
		// 测试重定向
		req, _ = http.NewRequest("GET", "/"+response.ShortCode, nil)
		w = httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		assert.Equal(t, http.StatusMovedPermanently, w.Code)
		assert.Equal(t, "https://www.example.com", w.Header().Get("Location"))
	})

	t.Run("Non-existent short code", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/nonexistent", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		assert.Equal(t, http.StatusNotFound, w.Code)
		
		var errorResp models.ErrorResponse
		err := json.Unmarshal(w.Body.Bytes(), &errorResp)
		require.NoError(t, err)
		assert.Equal(t, "url_not_found", errorResp.Error)
	})
}

func TestURLHandler_GetURLInfo(t *testing.T) {
	router, _ := setupTestRouter()

	t.Run("Valid short code", func(t *testing.T) {
		// 先创建一个短链接
		reqBody := models.ShortenRequest{
			URL: "https://www.example.com",
		}
		jsonBody, _ := json.Marshal(reqBody)
		
		req, _ := http.NewRequest("POST", "/shorten", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		var response models.ShortenResponse
		json.Unmarshal(w.Body.Bytes(), &response)
		
		// 获取 URL 信息
		req, _ = http.NewRequest("GET", "/info/"+response.ShortCode, nil)
		w = httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		assert.Equal(t, http.StatusOK, w.Code)
		
		var infoResp models.URLInfoResponse
		err := json.Unmarshal(w.Body.Bytes(), &infoResp)
		require.NoError(t, err)
		
		assert.Equal(t, response.ID, infoResp.ID)
		assert.Equal(t, "https://www.example.com", infoResp.OriginalURL)
		assert.Equal(t, response.ShortCode, infoResp.ShortCode)
		assert.Equal(t, uint64(0), infoResp.AccessCount)
	})
}

func TestURLHandler_HealthCheck(t *testing.T) {
	router, _ := setupTestRouter()

	req, _ := http.NewRequest("GET", "/health", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	
	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)
	
	assert.Equal(t, "ok", response["status"])
	assert.Equal(t, "gin-url-shortener", response["service"])
}
