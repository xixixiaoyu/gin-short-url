package services

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"gin-url-shortener/config"
	"gin-url-shortener/storage"
)

func TestURLService_ShortenURL(t *testing.T) {
	// 设置测试环境
	memStorage := storage.NewMemoryStorage()
	cfg := &config.Config{
		BaseURL: "http://localhost:8080",
	}
	service := NewURLService(memStorage, cfg)

	t.Run("Valid URL", func(t *testing.T) {
		originalURL := "https://www.example.com"
		
		response, err := service.ShortenURL(originalURL)
		
		require.NoError(t, err)
		assert.NotEmpty(t, response.ShortCode)
		assert.Equal(t, originalURL, response.OriginalURL)
		assert.Equal(t, "http://localhost:8080/"+response.ShortCode, response.ShortURL)
		assert.NotZero(t, response.ID)
		assert.NotZero(t, response.CreatedAt)
	})

	t.Run("URL without protocol", func(t *testing.T) {
		originalURL := "www.example.com"
		expectedURL := "http://www.example.com"
		
		response, err := service.ShortenURL(originalURL)
		
		require.NoError(t, err)
		assert.Equal(t, expectedURL, response.OriginalURL)
	})

	t.Run("Duplicate URL", func(t *testing.T) {
		originalURL := "https://www.duplicate.com"
		
		// 第一次创建
		response1, err := service.ShortenURL(originalURL)
		require.NoError(t, err)
		
		// 第二次创建相同 URL
		response2, err := service.ShortenURL(originalURL)
		require.NoError(t, err)
		
		// 应该返回相同的短码
		assert.Equal(t, response1.ShortCode, response2.ShortCode)
		assert.Equal(t, response1.ID, response2.ID)
	})

	t.Run("Invalid URL", func(t *testing.T) {
		invalidURLs := []string{
			"",
			"   ",
			"not-a-url",
			"ftp://example.com", // 不支持的协议
		}
		
		for _, invalidURL := range invalidURLs {
			_, err := service.ShortenURL(invalidURL)
			assert.Error(t, err, "Should return error for invalid URL: %s", invalidURL)
			assert.Equal(t, ErrInvalidURL, err)
		}
	})
}

func TestURLService_GetOriginalURL(t *testing.T) {
	// 设置测试环境
	memStorage := storage.NewMemoryStorage()
	cfg := &config.Config{
		BaseURL: "http://localhost:8080",
	}
	service := NewURLService(memStorage, cfg)

	t.Run("Valid short code", func(t *testing.T) {
		originalURL := "https://www.example.com"
		
		// 先创建短链接
		response, err := service.ShortenURL(originalURL)
		require.NoError(t, err)
		
		// 获取原始 URL
		retrievedURL, err := service.GetOriginalURL(response.ShortCode)
		require.NoError(t, err)
		assert.Equal(t, originalURL, retrievedURL)
	})

	t.Run("Non-existent short code", func(t *testing.T) {
		_, err := service.GetOriginalURL("nonexistent")
		assert.Error(t, err)
		assert.Equal(t, ErrURLNotFound, err)
	})

	t.Run("Invalid short code format", func(t *testing.T) {
		invalidCodes := []string{
			"",
			"invalid!",
			"test@code",
		}
		
		for _, code := range invalidCodes {
			_, err := service.GetOriginalURL(code)
			assert.Error(t, err, "Should return error for invalid code: %s", code)
			assert.Equal(t, ErrInvalidShortCode, err)
		}
	})
}

func TestURLService_GetURLInfo(t *testing.T) {
	// 设置测试环境
	memStorage := storage.NewMemoryStorage()
	cfg := &config.Config{
		BaseURL: "http://localhost:8080",
	}
	service := NewURLService(memStorage, cfg)

	t.Run("Valid short code", func(t *testing.T) {
		originalURL := "https://www.example.com"
		
		// 先创建短链接
		response, err := service.ShortenURL(originalURL)
		require.NoError(t, err)
		
		// 获取 URL 信息
		info, err := service.GetURLInfo(response.ShortCode)
		require.NoError(t, err)
		
		assert.Equal(t, response.ID, info.ID)
		assert.Equal(t, originalURL, info.OriginalURL)
		assert.Equal(t, response.ShortCode, info.ShortCode)
		assert.Equal(t, response.ShortURL, info.ShortURL)
		assert.Equal(t, uint64(0), info.AccessCount) // 初始访问次数为 0
	})

	t.Run("Access count increment", func(t *testing.T) {
		originalURL := "https://www.test-access.com"
		
		// 创建短链接
		response, err := service.ShortenURL(originalURL)
		require.NoError(t, err)
		
		// 访问短链接几次
		for i := 0; i < 3; i++ {
			_, err := service.GetOriginalURL(response.ShortCode)
			require.NoError(t, err)
		}
		
		// 检查访问次数
		info, err := service.GetURLInfo(response.ShortCode)
		require.NoError(t, err)
		assert.Equal(t, uint64(3), info.AccessCount)
	})
}
