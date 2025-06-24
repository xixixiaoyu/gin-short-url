package storage

import (
	"errors"
	"sync"
	"time"

	"gin-url-shortener/models"
	"gin-url-shortener/utils"
)

var (
	ErrURLNotFound = errors.New("URL not found")
	ErrURLExists   = errors.New("URL already exists")
)

// MemoryStorage 内存存储实现
type MemoryStorage struct {
	urls       map[string]*models.URL // shortCode -> URL
	urlsByID   map[uint64]*models.URL // id -> URL
	urlsByOrig map[string]*models.URL // originalURL -> URL (用于去重)
	nextID     uint64
	mutex      sync.RWMutex
}

// NewMemoryStorage 创建新的内存存储实例
func NewMemoryStorage() *MemoryStorage {
	return &MemoryStorage{
		urls:       make(map[string]*models.URL),
		urlsByID:   make(map[uint64]*models.URL),
		urlsByOrig: make(map[string]*models.URL),
		nextID:     1,
	}
}

// Save 保存 URL 记录
func (s *MemoryStorage) Save(originalURL string) (*models.URL, error) {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	// 检查是否已存在相同的原始 URL
	if existingURL, exists := s.urlsByOrig[originalURL]; exists {
		return existingURL, nil
	}

	// 生成新的 URL 记录
	url := &models.URL{
		ID:          s.nextID,
		OriginalURL: originalURL,
		ShortCode:   utils.EncodeBase62(s.nextID),
		CreatedAt:   time.Now(),
		AccessCount: 0,
	}

	// 保存到各个映射中
	s.urls[url.ShortCode] = url
	s.urlsByID[url.ID] = url
	s.urlsByOrig[originalURL] = url

	s.nextID++
	return url, nil
}

// GetByShortCode 根据短码获取 URL 记录
func (s *MemoryStorage) GetByShortCode(shortCode string) (*models.URL, error) {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	url, exists := s.urls[shortCode]
	if !exists {
		return nil, ErrURLNotFound
	}

	return url, nil
}

// GetByID 根据 ID 获取 URL 记录
func (s *MemoryStorage) GetByID(id uint64) (*models.URL, error) {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	url, exists := s.urlsByID[id]
	if !exists {
		return nil, ErrURLNotFound
	}

	return url, nil
}

// IncrementAccessCount 增加访问计数
func (s *MemoryStorage) IncrementAccessCount(shortCode string) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	url, exists := s.urls[shortCode]
	if !exists {
		return ErrURLNotFound
	}

	url.AccessCount++
	return nil
}

// GetStats 获取存储统计信息
func (s *MemoryStorage) GetStats() map[string]interface{} {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	return map[string]interface{}{
		"total_urls": len(s.urls),
		"next_id":    s.nextID,
	}
}

// GetAllURLs 获取所有 URL 记录（用于测试和调试）
func (s *MemoryStorage) GetAllURLs() []*models.URL {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	urls := make([]*models.URL, 0, len(s.urls))
	for _, url := range s.urls {
		urls = append(urls, url)
	}

	return urls
}
