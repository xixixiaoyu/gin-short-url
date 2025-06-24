# 第6章：存储层实现

## 🎯 本章目标

实现高性能的存储层：
- 内存存储实现
- 并发安全机制
- CRUD 操作
- 性能优化

## 🏗 存储层架构

### 存储接口设计

```go
// URLStorage 存储接口定义
type URLStorage interface {
    Save(originalURL string) (*models.URL, error)
    GetByShortCode(shortCode string) (*models.URL, error)
    GetByID(id uint64) (*models.URL, error)
    IncrementAccessCount(shortCode string) error
    GetStats() map[string]interface{}
}
```

### 设计原则

1. **接口隔离**：定义清晰的存储接口
2. **并发安全**：支持多协程并发访问
3. **性能优化**：使用高效的数据结构
4. **错误处理**：明确的错误类型和处理

## 💾 内存存储实现

### 创建 storage/memory_storage.go

```go
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
```

### 存储结构说明

| 字段 | 类型 | 用途 | 时间复杂度 |
|------|------|------|------------|
| `urls` | `map[string]*models.URL` | 短码到 URL 的映射 | O(1) |
| `urlsByID` | `map[uint64]*models.URL` | ID 到 URL 的映射 | O(1) |
| `urlsByOrig` | `map[string]*models.URL` | 原始 URL 去重 | O(1) |
| `nextID` | `uint64` | 自增 ID 生成器 | - |
| `mutex` | `sync.RWMutex` | 读写锁 | - |

### 构造函数

```go
// NewMemoryStorage 创建新的内存存储实例
func NewMemoryStorage() *MemoryStorage {
    return &MemoryStorage{
        urls:       make(map[string]*models.URL),
        urlsByID:   make(map[uint64]*models.URL),
        urlsByOrig: make(map[string]*models.URL),
        nextID:     1,
    }
}
```

## 🔒 并发安全机制

### 读写锁的使用

```go
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
```

### 读操作优化

```go
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
```

## 📊 CRUD 操作实现

### 更新操作

```go
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

// UpdateURL 更新 URL 记录（扩展功能）
func (s *MemoryStorage) UpdateURL(shortCode string, updates map[string]interface{}) error {
    s.mutex.Lock()
    defer s.mutex.Unlock()

    url, exists := s.urls[shortCode]
    if !exists {
        return ErrURLNotFound
    }

    // 应用更新
    for key, value := range updates {
        switch key {
        case "access_count":
            if count, ok := value.(uint64); ok {
                url.AccessCount = count
            }
        // 可以添加更多字段的更新逻辑
        }
    }

    return nil
}
```

### 删除操作

```go
// Delete 删除 URL 记录
func (s *MemoryStorage) Delete(shortCode string) error {
    s.mutex.Lock()
    defer s.mutex.Unlock()

    url, exists := s.urls[shortCode]
    if !exists {
        return ErrURLNotFound
    }

    // 从所有映射中删除
    delete(s.urls, shortCode)
    delete(s.urlsByID, url.ID)
    delete(s.urlsByOrig, url.OriginalURL)

    return nil
}
```

## 📈 统计和查询功能

### 统计信息

```go
// GetStats 获取存储统计信息
func (s *MemoryStorage) GetStats() map[string]interface{} {
    s.mutex.RLock()
    defer s.mutex.RUnlock()

    var totalAccesses uint64
    for _, url := range s.urls {
        totalAccesses += url.AccessCount
    }

    return map[string]interface{}{
        "total_urls":     len(s.urls),
        "next_id":        s.nextID,
        "total_accesses": totalAccesses,
        "memory_usage":   s.estimateMemoryUsage(),
    }
}

// estimateMemoryUsage 估算内存使用量
func (s *MemoryStorage) estimateMemoryUsage() int64 {
    // 简单估算：每个 URL 记录约 200 字节
    return int64(len(s.urls)) * 200
}
```

### 批量查询

```go
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

// GetURLsByDateRange 按日期范围查询 URL
func (s *MemoryStorage) GetURLsByDateRange(start, end time.Time) []*models.URL {
    s.mutex.RLock()
    defer s.mutex.RUnlock()

    var urls []*models.URL
    for _, url := range s.urls {
        if url.CreatedAt.After(start) && url.CreatedAt.Before(end) {
            urls = append(urls, url)
        }
    }

    return urls
}
```

## 🧪 存储层测试

### 创建 storage/memory_storage_test.go

```go
package storage

import (
    "testing"
    "time"

    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

func TestMemoryStorage_Save(t *testing.T) {
    storage := NewMemoryStorage()

    t.Run("Save new URL", func(t *testing.T) {
        originalURL := "https://www.example.com"
        
        url, err := storage.Save(originalURL)
        
        require.NoError(t, err)
        assert.Equal(t, uint64(1), url.ID)
        assert.Equal(t, originalURL, url.OriginalURL)
        assert.NotEmpty(t, url.ShortCode)
        assert.Equal(t, uint64(0), url.AccessCount)
        assert.WithinDuration(t, time.Now(), url.CreatedAt, time.Second)
    })

    t.Run("Save duplicate URL", func(t *testing.T) {
        originalURL := "https://www.duplicate.com"
        
        // 第一次保存
        url1, err := storage.Save(originalURL)
        require.NoError(t, err)
        
        // 第二次保存相同 URL
        url2, err := storage.Save(originalURL)
        require.NoError(t, err)
        
        // 应该返回相同的记录
        assert.Equal(t, url1.ID, url2.ID)
        assert.Equal(t, url1.ShortCode, url2.ShortCode)
    })
}

func TestMemoryStorage_GetByShortCode(t *testing.T) {
    storage := NewMemoryStorage()
    originalURL := "https://www.example.com"
    
    // 先保存一个 URL
    savedURL, err := storage.Save(originalURL)
    require.NoError(t, err)

    t.Run("Get existing URL", func(t *testing.T) {
        url, err := storage.GetByShortCode(savedURL.ShortCode)
        
        require.NoError(t, err)
        assert.Equal(t, savedURL.ID, url.ID)
        assert.Equal(t, originalURL, url.OriginalURL)
    })

    t.Run("Get non-existing URL", func(t *testing.T) {
        _, err := storage.GetByShortCode("nonexistent")
        
        assert.Error(t, err)
        assert.Equal(t, ErrURLNotFound, err)
    })
}
```

### 并发测试

```go
func TestMemoryStorage_Concurrent(t *testing.T) {
    storage := NewMemoryStorage()
    
    // 并发保存测试
    t.Run("Concurrent Save", func(t *testing.T) {
        const numGoroutines = 100
        const urlsPerGoroutine = 10
        
        var wg sync.WaitGroup
        wg.Add(numGoroutines)
        
        for i := 0; i < numGoroutines; i++ {
            go func(goroutineID int) {
                defer wg.Done()
                
                for j := 0; j < urlsPerGoroutine; j++ {
                    url := fmt.Sprintf("https://example%d-%d.com", goroutineID, j)
                    _, err := storage.Save(url)
                    assert.NoError(t, err)
                }
            }(i)
        }
        
        wg.Wait()
        
        stats := storage.GetStats()
        assert.Equal(t, numGoroutines*urlsPerGoroutine, stats["total_urls"])
    })
}
```

## ⚡ 性能优化

### 内存池优化

```go
import "sync"

// URLPool URL 对象池
var urlPool = sync.Pool{
    New: func() interface{} {
        return &models.URL{}
    },
}

// getURL 从对象池获取 URL 对象
func getURL() *models.URL {
    return urlPool.Get().(*models.URL)
}

// putURL 将 URL 对象放回池中
func putURL(url *models.URL) {
    // 重置对象
    *url = models.URL{}
    urlPool.Put(url)
}
```

### 批量操作优化

```go
// SaveBatch 批量保存 URL
func (s *MemoryStorage) SaveBatch(originalURLs []string) ([]*models.URL, error) {
    s.mutex.Lock()
    defer s.mutex.Unlock()

    results := make([]*models.URL, 0, len(originalURLs))
    
    for _, originalURL := range originalURLs {
        // 检查是否已存在
        if existingURL, exists := s.urlsByOrig[originalURL]; exists {
            results = append(results, existingURL)
            continue
        }

        // 创建新记录
        url := &models.URL{
            ID:          s.nextID,
            OriginalURL: originalURL,
            ShortCode:   utils.EncodeBase62(s.nextID),
            CreatedAt:   time.Now(),
            AccessCount: 0,
        }

        // 保存到映射
        s.urls[url.ShortCode] = url
        s.urlsByID[url.ID] = url
        s.urlsByOrig[originalURL] = url

        results = append(results, url)
        s.nextID++
    }

    return results, nil
}
```

## 📊 性能基准测试

### 创建基准测试

```go
func BenchmarkMemoryStorage_Save(b *testing.B) {
    storage := NewMemoryStorage()

    b.ResetTimer()
    b.RunParallel(func(pb *testing.PB) {
        i := 0
        for pb.Next() {
            url := fmt.Sprintf("https://www.example%d.com", i)
            _, err := storage.Save(url)
            if err != nil {
                b.Errorf("Save failed: %v", err)
            }
            i++
        }
    })
}

func BenchmarkMemoryStorage_GetByShortCode(b *testing.B) {
    storage := NewMemoryStorage()

    // 预先保存一些 URL
    shortCodes := make([]string, 1000)
    for i := 0; i < 1000; i++ {
        url := fmt.Sprintf("https://www.example%d.com", i)
        urlRecord, err := storage.Save(url)
        if err != nil {
            b.Fatalf("Failed to save URL: %v", err)
        }
        shortCodes[i] = urlRecord.ShortCode
    }

    b.ResetTimer()
    b.RunParallel(func(pb *testing.PB) {
        i := 0
        for pb.Next() {
            shortCode := shortCodes[i%len(shortCodes)]
            _, err := storage.GetByShortCode(shortCode)
            if err != nil {
                b.Errorf("GetByShortCode failed: %v", err)
            }
            i++
        }
    })
}
```

## 🔍 监控和调试

### 存储监控

```go
// Monitor 存储监控信息
type Monitor struct {
    storage *MemoryStorage
    ticker  *time.Ticker
    done    chan bool
}

// NewMonitor 创建存储监控器
func NewMonitor(storage *MemoryStorage) *Monitor {
    return &Monitor{
        storage: storage,
        ticker:  time.NewTicker(30 * time.Second),
        done:    make(chan bool),
    }
}

// Start 开始监控
func (m *Monitor) Start() {
    go func() {
        for {
            select {
            case <-m.ticker.C:
                stats := m.storage.GetStats()
                fmt.Printf("Storage Stats: %+v\n", stats)
            case <-m.done:
                return
            }
        }
    }()
}

// Stop 停止监控
func (m *Monitor) Stop() {
    m.ticker.Stop()
    m.done <- true
}
```

## 📝 小结

本章我们实现了高性能的内存存储层：

1. **并发安全**：使用读写锁保护数据
2. **高效查询**：多个哈希表支持 O(1) 查询
3. **完整功能**：CRUD 操作和统计功能
4. **性能优化**：对象池和批量操作
5. **测试覆盖**：单元测试和基准测试

关键要点：
- 读写锁提供并发安全和性能平衡
- 多个映射表支持不同维度的快速查询
- 去重机制避免重复 URL
- 完整的测试确保存储层可靠性

下一章我们将实现业务逻辑服务层，封装核心业务规则。
