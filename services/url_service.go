package services

import (
	"errors"
	"net/url"
	"strings"

	"gin-url-shortener/config"
	"gin-url-shortener/models"
	"gin-url-shortener/storage"
	"gin-url-shortener/utils"
)

var (
	ErrInvalidURL    = errors.New("invalid URL format")
	ErrURLNotFound   = errors.New("short URL not found")
	ErrInvalidShortCode = errors.New("invalid short code format")
)

// URLService URL 业务逻辑服务
type URLService struct {
	storage *storage.MemoryStorage
	config  *config.Config
}

// NewURLService 创建新的 URL 服务实例
func NewURLService(storage *storage.MemoryStorage, config *config.Config) *URLService {
	return &URLService{
		storage: storage,
		config:  config,
	}
}

// ShortenURL 创建短链接
func (s *URLService) ShortenURL(originalURL string) (*models.ShortenResponse, error) {
	// 验证 URL 格式
	if err := s.validateURL(originalURL); err != nil {
		return nil, err
	}

	// 标准化 URL（确保有协议前缀）
	normalizedURL := s.normalizeURL(originalURL)

	// 保存到存储
	urlRecord, err := s.storage.Save(normalizedURL)
	if err != nil {
		return nil, err
	}

	// 构建响应
	response := &models.ShortenResponse{
		ID:          urlRecord.ID,
		OriginalURL: urlRecord.OriginalURL,
		ShortCode:   urlRecord.ShortCode,
		ShortURL:    s.buildShortURL(urlRecord.ShortCode),
		CreatedAt:   urlRecord.CreatedAt,
	}

	return response, nil
}

// GetOriginalURL 根据短码获取原始 URL 并增加访问计数
func (s *URLService) GetOriginalURL(shortCode string) (string, error) {
	// 验证短码格式
	if !utils.IsValidBase62(shortCode) {
		return "", ErrInvalidShortCode
	}

	// 获取 URL 记录
	urlRecord, err := s.storage.GetByShortCode(shortCode)
	if err != nil {
		if err == storage.ErrURLNotFound {
			return "", ErrURLNotFound
		}
		return "", err
	}

	// 增加访问计数
	if err := s.storage.IncrementAccessCount(shortCode); err != nil {
		// 记录错误但不影响重定向
		// 在实际应用中可以使用日志记录
	}

	return urlRecord.OriginalURL, nil
}

// GetURLInfo 获取短链接详细信息
func (s *URLService) GetURLInfo(shortCode string) (*models.URLInfoResponse, error) {
	// 验证短码格式
	if !utils.IsValidBase62(shortCode) {
		return nil, ErrInvalidShortCode
	}

	// 获取 URL 记录
	urlRecord, err := s.storage.GetByShortCode(shortCode)
	if err != nil {
		if err == storage.ErrURLNotFound {
			return nil, ErrURLNotFound
		}
		return nil, err
	}

	// 构建响应
	response := &models.URLInfoResponse{
		ID:          urlRecord.ID,
		OriginalURL: urlRecord.OriginalURL,
		ShortCode:   urlRecord.ShortCode,
		ShortURL:    s.buildShortURL(urlRecord.ShortCode),
		CreatedAt:   urlRecord.CreatedAt,
		AccessCount: urlRecord.AccessCount,
	}

	return response, nil
}

// validateURL 验证 URL 格式
func (s *URLService) validateURL(rawURL string) error {
	if strings.TrimSpace(rawURL) == "" {
		return ErrInvalidURL
	}

	// 尝试解析 URL
	parsedURL, err := url.Parse(rawURL)
	if err != nil {
		return ErrInvalidURL
	}

	// 检查是否有有效的 scheme 和 host
	if parsedURL.Scheme == "" || parsedURL.Host == "" {
		// 尝试添加 http:// 前缀后再次解析
		if parsedURL, err = url.Parse("http://" + rawURL); err != nil {
			return ErrInvalidURL
		}
		if parsedURL.Host == "" {
			return ErrInvalidURL
		}
	}

	// 检查 scheme 是否为 http 或 https
	if parsedURL.Scheme != "http" && parsedURL.Scheme != "https" {
		return ErrInvalidURL
	}

	// 额外验证：检查主机名是否包含点号（基本的域名格式检查）
	// 排除纯文本和无效格式
	if !strings.Contains(parsedURL.Host, ".") && parsedURL.Host != "localhost" {
		return ErrInvalidURL
	}

	return nil
}

// normalizeURL 标准化 URL
func (s *URLService) normalizeURL(rawURL string) string {
	parsedURL, err := url.Parse(rawURL)
	if err != nil {
		// 如果解析失败，尝试添加 http:// 前缀
		if parsedURL, err = url.Parse("http://" + rawURL); err != nil {
			return rawURL // 返回原始 URL
		}
	}

	// 如果没有 scheme，添加 http://
	if parsedURL.Scheme == "" {
		parsedURL.Scheme = "http"
	}

	return parsedURL.String()
}

// buildShortURL 构建完整的短链接 URL
func (s *URLService) buildShortURL(shortCode string) string {
	baseURL := strings.TrimRight(s.config.BaseURL, "/")
	return baseURL + "/" + shortCode
}
