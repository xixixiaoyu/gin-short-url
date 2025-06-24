# 第10章：单元测试编写

## 🎯 本章目标

学习如何编写高质量的单元测试：
- 测试策略和最佳实践
- 使用 Testify 框架
- Mock 和依赖注入
- 测试覆盖率分析

## 🧪 测试策略

### 测试金字塔

```
    /\
   /  \
  /    \  E2E Tests (少量)
 /______\
/        \
\        / Integration Tests (适量)
 \______/
/        \
\        / Unit Tests (大量)
 \______/
```

### 测试分类

| 测试类型 | 范围 | 速度 | 数量 | 目的 |
|----------|------|------|------|------|
| **单元测试** | 单个函数/方法 | 快 | 多 | 验证逻辑正确性 |
| **集成测试** | 多个组件 | 中等 | 适量 | 验证组件协作 |
| **端到端测试** | 整个系统 | 慢 | 少 | 验证用户场景 |

## 🔧 测试工具和框架

### Testify 框架

```go
import (
    "testing"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
    "github.com/stretchr/testify/mock"
    "github.com/stretchr/testify/suite"
)
```

### 断言方法对比

| 方法 | 失败时行为 | 使用场景 |
|------|------------|----------|
| `assert.*` | 记录错误，继续执行 | 一般验证 |
| `require.*` | 立即停止测试 | 关键前置条件 |

## 📝 编写单元测试

### Base62 编码测试

```go
// utils/base62_test.go
package utils

import (
    "testing"
    "github.com/stretchr/testify/assert"
)

func TestEncodeBase62(t *testing.T) {
    tests := []struct {
        name     string
        input    uint64
        expected string
    }{
        {"Zero", 0, "0"},
        {"One", 1, "1"},
        {"Ten", 10, "a"},
        {"Base62", 62, "10"},
        {"Large number", 3844, "100"},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := EncodeBase62(tt.input)
            assert.Equal(t, tt.expected, result)
        })
    }
}

func TestDecodeBase62(t *testing.T) {
    tests := []struct {
        name     string
        input    string
        expected uint64
    }{
        {"Zero", "0", 0},
        {"One", "1", 1},
        {"Ten", "a", 10},
        {"Base62", "10", 62},
        {"Large number", "100", 3844},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := DecodeBase62(tt.input)
            assert.Equal(t, tt.expected, result)
        })
    }
}

// 往返测试（Round-trip Test）
func TestBase62RoundTrip(t *testing.T) {
    testValues := []uint64{0, 1, 10, 62, 123, 1000, 3844, 999999}

    for _, value := range testValues {
        t.Run(fmt.Sprintf("Value_%d", value), func(t *testing.T) {
            encoded := EncodeBase62(value)
            decoded := DecodeBase62(encoded)
            assert.Equal(t, value, decoded, 
                "Round trip failed for value %d", value)
        })
    }
}
```

### 表驱动测试模式

```go
func TestIsValidBase62(t *testing.T) {
    tests := []struct {
        name     string
        input    string
        expected bool
    }{
        {"Valid digits", "123", true},
        {"Valid lowercase", "abc", true},
        {"Valid uppercase", "ABC", true},
        {"Valid mixed", "abc123XYZ", true},
        {"Empty string", "", false},
        {"Invalid character", "abc!", false},
        {"Special characters", "test-case", false},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := IsValidBase62(tt.input)
            assert.Equal(t, tt.expected, result, 
                "IsValidBase62(%s) should return %t", tt.input, tt.expected)
        })
    }
}
```

## 🎭 Mock 和依赖注入

### 创建 Mock 存储

```go
// storage/mock_storage.go
package storage

import (
    "github.com/stretchr/testify/mock"
    "gin-url-shortener/models"
)

// MockStorage Mock 存储实现
type MockStorage struct {
    mock.Mock
}

func (m *MockStorage) Save(originalURL string) (*models.URL, error) {
    args := m.Called(originalURL)
    return args.Get(0).(*models.URL), args.Error(1)
}

func (m *MockStorage) GetByShortCode(shortCode string) (*models.URL, error) {
    args := m.Called(shortCode)
    if args.Get(0) == nil {
        return nil, args.Error(1)
    }
    return args.Get(0).(*models.URL), args.Error(1)
}

func (m *MockStorage) GetByID(id uint64) (*models.URL, error) {
    args := m.Called(id)
    if args.Get(0) == nil {
        return nil, args.Error(1)
    }
    return args.Get(0).(*models.URL), args.Error(1)
}

func (m *MockStorage) IncrementAccessCount(shortCode string) error {
    args := m.Called(shortCode)
    return args.Error(0)
}

func (m *MockStorage) GetStats() map[string]interface{} {
    args := m.Called()
    return args.Get(0).(map[string]interface{})
}
```

### 使用 Mock 测试服务层

```go
// services/url_service_test.go
func TestURLService_ShortenURL_WithMock(t *testing.T) {
    // 创建 Mock 存储
    mockStorage := &storage.MockStorage{}
    config := &config.Config{
        BaseURL:      "http://localhost:8080",
        MaxURLLength: 2048,
    }
    service := NewURLService(mockStorage, config)

    t.Run("Successful URL shortening", func(t *testing.T) {
        originalURL := "https://www.example.com"
        expectedURL := &models.URL{
            ID:          1,
            OriginalURL: originalURL,
            ShortCode:   "1",
            CreatedAt:   time.Now(),
            AccessCount: 0,
        }

        // 设置 Mock 期望
        mockStorage.On("Save", originalURL).Return(expectedURL, nil)

        // 执行测试
        response, err := service.ShortenURL(originalURL)

        // 验证结果
        require.NoError(t, err)
        assert.Equal(t, expectedURL.ID, response.ID)
        assert.Equal(t, originalURL, response.OriginalURL)
        assert.Equal(t, "1", response.ShortCode)

        // 验证 Mock 调用
        mockStorage.AssertExpectations(t)
    })

    t.Run("Storage error", func(t *testing.T) {
        originalURL := "https://www.example.com"
        expectedError := errors.New("storage error")

        // 设置 Mock 期望
        mockStorage.On("Save", originalURL).Return(nil, expectedError)

        // 执行测试
        _, err := service.ShortenURL(originalURL)

        // 验证错误
        assert.Error(t, err)
        mockStorage.AssertExpectations(t)
    })
}
```

## 🌐 HTTP 处理器测试

### 测试 HTTP 端点

```go
// handlers/url_handler_test.go
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
)

func setupTestRouter() (*gin.Engine, *URLHandler) {
    gin.SetMode(gin.TestMode)
    
    // 使用真实的存储和服务（集成测试）
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
        req, _ := http.NewRequest("POST", "/shorten", 
            bytes.NewBuffer([]byte("invalid json")))
        req.Header.Set("Content-Type", "application/json")
        
        w := httptest.NewRecorder()
        router.ServeHTTP(w, req)
        
        assert.Equal(t, http.StatusBadRequest, w.Code)
        
        var errorResp models.ErrorResponse
        err := json.Unmarshal(w.Body.Bytes(), &errorResp)
        require.NoError(t, err)
        assert.Equal(t, "invalid_request", errorResp.Error)
    })
}
```

### 测试重定向功能

```go
func TestURLHandler_RedirectURL(t *testing.T) {
    router, _ := setupTestRouter()

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

    t.Run("Valid redirect", func(t *testing.T) {
        req, _ := http.NewRequest("GET", "/"+response.ShortCode, nil)
        w := httptest.NewRecorder()
        router.ServeHTTP(w, req)
        
        assert.Equal(t, http.StatusMovedPermanently, w.Code)
        assert.Equal(t, "https://www.example.com", w.Header().Get("Location"))
    })

    t.Run("Non-existent short code", func(t *testing.T) {
        req, _ := http.NewRequest("GET", "/nonexistent", nil)
        w := httptest.NewRecorder()
        router.ServeHTTP(w, req)
        
        assert.Equal(t, http.StatusNotFound, w.Code)
    })
}
```

## 🧩 测试套件（Test Suites）

### 使用 Testify Suite

```go
// services/url_service_suite_test.go
package services

import (
    "testing"
    "github.com/stretchr/testify/suite"
)

// URLServiceTestSuite 测试套件
type URLServiceTestSuite struct {
    suite.Suite
    storage *storage.MemoryStorage
    config  *config.Config
    service *URLService
}

// SetupTest 每个测试前的设置
func (suite *URLServiceTestSuite) SetupTest() {
    suite.storage = storage.NewMemoryStorage()
    suite.config = &config.Config{
        BaseURL:      "http://localhost:8080",
        MaxURLLength: 2048,
    }
    suite.service = NewURLService(suite.storage, suite.config)
}

// TestValidURL 测试有效 URL
func (suite *URLServiceTestSuite) TestValidURL() {
    originalURL := "https://www.example.com"
    
    response, err := suite.service.ShortenURL(originalURL)
    
    suite.NoError(err)
    suite.NotEmpty(response.ShortCode)
    suite.Equal(originalURL, response.OriginalURL)
}

// TestInvalidURL 测试无效 URL
func (suite *URLServiceTestSuite) TestInvalidURL() {
    invalidURL := "not-a-url"
    
    _, err := suite.service.ShortenURL(invalidURL)
    
    suite.Error(err)
    suite.Equal(ErrInvalidURL, err)
}

// 运行测试套件
func TestURLServiceTestSuite(t *testing.T) {
    suite.Run(t, new(URLServiceTestSuite))
}
```

## 📊 测试覆盖率

### 生成覆盖率报告

```bash
# 运行测试并生成覆盖率
go test -coverprofile=coverage.out ./...

# 查看覆盖率统计
go tool cover -func=coverage.out

# 生成 HTML 报告
go tool cover -html=coverage.out -o coverage.html
```

### 覆盖率分析

```bash
# 按包查看覆盖率
go test -cover ./...

# 详细覆盖率信息
go test -coverprofile=coverage.out -covermode=count ./...
go tool cover -func=coverage.out | grep -E "(total|TOTAL)"
```

### 覆盖率目标

| 组件 | 目标覆盖率 | 说明 |
|------|------------|------|
| **工具函数** | 95%+ | 纯函数，易于测试 |
| **业务逻辑** | 85%+ | 核心逻辑必须覆盖 |
| **HTTP 处理器** | 80%+ | 包含错误处理路径 |
| **配置管理** | 70%+ | 环境相关代码 |

## 🔧 测试工具和技巧

### 测试辅助函数

```go
// testutils/helpers.go
package testutils

import (
    "testing"
    "time"
    "gin-url-shortener/models"
)

// CreateTestURL 创建测试用的 URL 对象
func CreateTestURL(id uint64, originalURL string) *models.URL {
    return &models.URL{
        ID:          id,
        OriginalURL: originalURL,
        ShortCode:   fmt.Sprintf("test%d", id),
        CreatedAt:   time.Now(),
        AccessCount: 0,
    }
}

// AssertURLEqual 比较两个 URL 对象
func AssertURLEqual(t *testing.T, expected, actual *models.URL) {
    assert.Equal(t, expected.ID, actual.ID)
    assert.Equal(t, expected.OriginalURL, actual.OriginalURL)
    assert.Equal(t, expected.ShortCode, actual.ShortCode)
    assert.Equal(t, expected.AccessCount, actual.AccessCount)
}
```

### 并发测试

```go
func TestConcurrentAccess(t *testing.T) {
    storage := storage.NewMemoryStorage()
    
    const numGoroutines = 100
    const operationsPerGoroutine = 50
    
    var wg sync.WaitGroup
    wg.Add(numGoroutines)
    
    // 并发写入
    for i := 0; i < numGoroutines; i++ {
        go func(goroutineID int) {
            defer wg.Done()
            
            for j := 0; j < operationsPerGoroutine; j++ {
                url := fmt.Sprintf("https://example%d-%d.com", goroutineID, j)
                _, err := storage.Save(url)
                assert.NoError(t, err)
            }
        }(i)
    }
    
    wg.Wait()
    
    stats := storage.GetStats()
    expected := numGoroutines * operationsPerGoroutine
    assert.Equal(t, expected, stats["total_urls"])
}
```

### 基准测试

```go
func BenchmarkURLService_ShortenURL(b *testing.B) {
    storage := storage.NewMemoryStorage()
    config := &config.Config{
        BaseURL:      "http://localhost:8080",
        MaxURLLength: 2048,
    }
    service := NewURLService(storage, config)

    b.ResetTimer()
    b.RunParallel(func(pb *testing.PB) {
        i := 0
        for pb.Next() {
            url := fmt.Sprintf("https://www.example%d.com", i)
            _, err := service.ShortenURL(url)
            if err != nil {
                b.Errorf("ShortenURL failed: %v", err)
            }
            i++
        }
    })
}
```

## 📝 测试最佳实践

### 1. 测试命名规范

```go
// 好的命名
func TestURLService_ShortenURL_ValidURL_ReturnsShortCode(t *testing.T) {}
func TestURLService_ShortenURL_InvalidURL_ReturnsError(t *testing.T) {}

// 不好的命名
func TestShortenURL(t *testing.T) {}
func TestURL1(t *testing.T) {}
```

### 2. 测试组织

```go
func TestURLService_ShortenURL(t *testing.T) {
    // 测试设置
    service := setupTestService()
    
    t.Run("valid URL", func(t *testing.T) {
        // 具体测试逻辑
    })
    
    t.Run("invalid URL", func(t *testing.T) {
        // 具体测试逻辑
    })
    
    t.Run("duplicate URL", func(t *testing.T) {
        // 具体测试逻辑
    })
}
```

### 3. 断言选择

```go
// 使用 require 进行关键检查
response, err := service.ShortenURL(url)
require.NoError(t, err) // 如果失败，立即停止

// 使用 assert 进行一般验证
assert.NotEmpty(t, response.ShortCode)
assert.Equal(t, url, response.OriginalURL)
```

### 4. 测试数据管理

```go
// 使用常量定义测试数据
const (
    TestValidURL   = "https://www.example.com"
    TestInvalidURL = "not-a-url"
    TestBaseURL    = "http://localhost:8080"
)

// 使用工厂函数创建测试对象
func createTestConfig() *config.Config {
    return &config.Config{
        BaseURL:      TestBaseURL,
        MaxURLLength: 2048,
    }
}
```

## 📝 小结

本章我们学习了完整的单元测试编写：

1. **测试策略**：测试金字塔和分层测试
2. **测试框架**：Testify 的使用和最佳实践
3. **Mock 技术**：依赖注入和 Mock 对象
4. **HTTP 测试**：端点测试和集成测试
5. **覆盖率分析**：测试质量度量

关键要点：
- 表驱动测试提高测试覆盖率
- Mock 对象隔离依赖，专注单元逻辑
- 测试套件组织复杂测试场景
- 覆盖率分析确保测试质量
- 并发测试验证线程安全

下一章我们将学习性能基准测试，优化系统性能。
