package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"gin-url-shortener/models"
	"gin-url-shortener/services"
)

// URLHandler URL 相关的 HTTP 处理器
type URLHandler struct {
	urlService *services.URLService
}

// NewURLHandler 创建新的 URL 处理器实例
func NewURLHandler(urlService *services.URLService) *URLHandler {
	return &URLHandler{
		urlService: urlService,
	}
}

// ShortenURL 处理创建短链接的请求
// POST /shorten
func (h *URLHandler) ShortenURL(c *gin.Context) {
	var req models.ShortenRequest

	// 绑定和验证请求参数
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: err.Error(),
		})
		return
	}

	// 调用服务层创建短链接
	response, err := h.urlService.ShortenURL(req.URL)
	if err != nil {
		switch err {
		case services.ErrInvalidURL:
			c.JSON(http.StatusBadRequest, models.ErrorResponse{
				Error:   "invalid_url",
				Message: "The provided URL is not valid",
			})
		default:
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{
				Error:   "internal_error",
				Message: "Failed to create short URL",
			})
		}
		return
	}

	c.JSON(http.StatusCreated, response)
}

// RedirectURL 处理短链接重定向
// GET /:shortCode
func (h *URLHandler) RedirectURL(c *gin.Context) {
	shortCode := c.Param("shortCode")

	// 获取原始 URL
	originalURL, err := h.urlService.GetOriginalURL(shortCode)
	if err != nil {
		switch err {
		case services.ErrURLNotFound:
			c.JSON(http.StatusNotFound, models.ErrorResponse{
				Error:   "url_not_found",
				Message: "Short URL not found",
			})
		case services.ErrInvalidShortCode:
			c.JSON(http.StatusBadRequest, models.ErrorResponse{
				Error:   "invalid_short_code",
				Message: "Invalid short code format",
			})
		default:
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{
				Error:   "internal_error",
				Message: "Failed to retrieve URL",
			})
		}
		return
	}

	// 执行重定向
	c.Redirect(http.StatusMovedPermanently, originalURL)
}

// GetURLInfo 处理获取短链接信息的请求
// GET /info/:shortCode
func (h *URLHandler) GetURLInfo(c *gin.Context) {
	shortCode := c.Param("shortCode")

	// 获取 URL 信息
	urlInfo, err := h.urlService.GetURLInfo(shortCode)
	if err != nil {
		switch err {
		case services.ErrURLNotFound:
			c.JSON(http.StatusNotFound, models.ErrorResponse{
				Error:   "url_not_found",
				Message: "Short URL not found",
			})
		case services.ErrInvalidShortCode:
			c.JSON(http.StatusBadRequest, models.ErrorResponse{
				Error:   "invalid_short_code",
				Message: "Invalid short code format",
			})
		default:
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{
				Error:   "internal_error",
				Message: "Failed to retrieve URL information",
			})
		}
		return
	}

	c.JSON(http.StatusOK, urlInfo)
}

// HealthCheck 健康检查端点
// GET /health
func (h *URLHandler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"service": "gin-url-shortener",
	})
}
