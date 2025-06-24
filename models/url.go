package models

import (
	"time"
)

// URL 表示一个短链接记录
type URL struct {
	ID          uint64    `json:"id"`          // 唯一标识符
	OriginalURL string    `json:"original_url"` // 原始长 URL
	ShortCode   string    `json:"short_code"`   // 短链接代码
	CreatedAt   time.Time `json:"created_at"`   // 创建时间
	AccessCount uint64    `json:"access_count"` // 访问次数
}

// ShortenRequest 表示创建短链接的请求
type ShortenRequest struct {
	URL string `json:"url" binding:"required,url"` // 原始 URL，必填且必须是有效 URL
}

// ShortenResponse 表示创建短链接的响应
type ShortenResponse struct {
	ID          uint64    `json:"id"`
	OriginalURL string    `json:"original_url"`
	ShortCode   string    `json:"short_code"`
	ShortURL    string    `json:"short_url"`    // 完整的短链接 URL
	CreatedAt   time.Time `json:"created_at"`
}

// URLInfoResponse 表示查询短链接信息的响应
type URLInfoResponse struct {
	ID          uint64    `json:"id"`
	OriginalURL string    `json:"original_url"`
	ShortCode   string    `json:"short_code"`
	ShortURL    string    `json:"short_url"`
	CreatedAt   time.Time `json:"created_at"`
	AccessCount uint64    `json:"access_count"`
}

// ErrorResponse 表示错误响应
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message,omitempty"`
}
