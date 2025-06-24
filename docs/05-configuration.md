# 第5章：配置管理系统

## 🎯 本章目标

实现灵活的配置管理系统：
- 环境变量支持
- 默认值设置
- 配置验证
- 多环境支持

## 🔧 配置系统设计

### 配置层次结构

```
配置优先级（从高到低）：
1. 环境变量
2. 配置文件
3. 默认值
```

### 配置分类

| 配置类型 | 示例 | 用途 |
|----------|------|------|
| **服务配置** | 端口、主机 | 服务启动参数 |
| **业务配置** | 基础 URL | 业务逻辑参数 |
| **运行配置** | 日志级别 | 运行时行为 |

## 💻 实现配置结构

### 创建 config/config.go

```go
package config

import (
    "os"
    "strconv"
    "strings"
)

// Config 应用配置结构
type Config struct {
    // 服务配置
    Port    string `json:"port"`     // 服务端口
    Host    string `json:"host"`     // 服务主机
    BaseURL string `json:"base_url"` // 基础 URL，用于生成完整的短链接
    
    // 运行配置
    LogLevel string `json:"log_level"` // 日志级别
    Debug    bool   `json:"debug"`     // 调试模式
    
    // 业务配置
    MaxURLLength int `json:"max_url_length"` // 最大 URL 长度
    DefaultTTL   int `json:"default_ttl"`    // 默认过期时间（秒）
}
```

### 默认配置

```go
// getDefaultConfig 返回默认配置
func getDefaultConfig() *Config {
    return &Config{
        // 服务配置
        Port:    "8080",
        Host:    "localhost",
        BaseURL: "http://localhost:8080",
        
        // 运行配置
        LogLevel: "info",
        Debug:    false,
        
        // 业务配置
        MaxURLLength: 2048,
        DefaultTTL:   0, // 0 表示永不过期
    }
}
```

## 🌍 环境变量支持

### 环境变量映射

```go
// envMapping 环境变量到配置字段的映射
var envMapping = map[string]func(*Config, string){
    "PORT":            func(c *Config, v string) { c.Port = v },
    "HOST":            func(c *Config, v string) { c.Host = v },
    "BASE_URL":        func(c *Config, v string) { c.BaseURL = v },
    "LOG_LEVEL":       func(c *Config, v string) { c.LogLevel = v },
    "DEBUG":           func(c *Config, v string) { c.Debug = parseBool(v) },
    "MAX_URL_LENGTH":  func(c *Config, v string) { c.MaxURLLength = parseInt(v, 2048) },
    "DEFAULT_TTL":     func(c *Config, v string) { c.DefaultTTL = parseInt(v, 0) },
}

// 辅助函数
func parseBool(s string) bool {
    b, _ := strconv.ParseBool(s)
    return b
}

func parseInt(s string, defaultValue int) int {
    if i, err := strconv.Atoi(s); err == nil {
        return i
    }
    return defaultValue
}
```

### 加载环境变量

```go
// loadFromEnv 从环境变量加载配置
func (c *Config) loadFromEnv() {
    for envKey, setter := range envMapping {
        if value := os.Getenv(envKey); value != "" {
            setter(c, value)
        }
    }
}
```

## 📁 配置文件支持

### JSON 配置文件

```go
import (
    "encoding/json"
    "io/ioutil"
    "path/filepath"
)

// loadFromFile 从 JSON 文件加载配置
func (c *Config) loadFromFile(filename string) error {
    if filename == "" {
        return nil // 没有指定配置文件
    }
    
    // 检查文件是否存在
    if _, err := os.Stat(filename); os.IsNotExist(err) {
        return nil // 文件不存在，使用默认配置
    }
    
    // 读取文件
    data, err := ioutil.ReadFile(filename)
    if err != nil {
        return fmt.Errorf("failed to read config file: %w", err)
    }
    
    // 解析 JSON
    if err := json.Unmarshal(data, c); err != nil {
        return fmt.Errorf("failed to parse config file: %w", err)
    }
    
    return nil
}
```

### 配置文件示例

创建 `config.json`：
```json
{
    "port": "3000",
    "base_url": "https://short.ly",
    "log_level": "debug",
    "debug": true,
    "max_url_length": 4096
}
```

## 🏗 配置加载器

### 主加载函数

```go
// LoadConfig 加载配置，支持环境变量覆盖默认值
func LoadConfig() *Config {
    return LoadConfigWithFile("")
}

// LoadConfigWithFile 从指定文件加载配置
func LoadConfigWithFile(configFile string) *Config {
    // 1. 从默认配置开始
    config := getDefaultConfig()
    
    // 2. 尝试从配置文件加载
    if err := config.loadFromFile(configFile); err != nil {
        // 记录错误但不中断程序
        fmt.Printf("Warning: failed to load config file: %v\n", err)
    }
    
    // 3. 从环境变量覆盖
    config.loadFromEnv()
    
    // 4. 验证配置
    if err := config.Validate(); err != nil {
        fmt.Printf("Warning: invalid configuration: %v\n", err)
    }
    
    return config
}
```

### 自动配置文件发现

```go
// findConfigFile 自动查找配置文件
func findConfigFile() string {
    candidates := []string{
        "config.json",
        "config/config.json",
        "/etc/gin-url-shortener/config.json",
        filepath.Join(os.Getenv("HOME"), ".gin-url-shortener.json"),
    }
    
    for _, candidate := range candidates {
        if _, err := os.Stat(candidate); err == nil {
            return candidate
        }
    }
    
    return ""
}

// LoadConfigAuto 自动发现并加载配置
func LoadConfigAuto() *Config {
    configFile := findConfigFile()
    return LoadConfigWithFile(configFile)
}
```

## ✅ 配置验证

### 验证方法

```go
// Validate 验证配置的有效性
func (c *Config) Validate() error {
    var errors []string
    
    // 验证端口
    if !c.IsValidPort() {
        errors = append(errors, fmt.Sprintf("invalid port: %s", c.Port))
    }
    
    // 验证基础 URL
    if !c.IsValidBaseURL() {
        errors = append(errors, fmt.Sprintf("invalid base URL: %s", c.BaseURL))
    }
    
    // 验证日志级别
    if !c.IsValidLogLevel() {
        errors = append(errors, fmt.Sprintf("invalid log level: %s", c.LogLevel))
    }
    
    // 验证业务参数
    if c.MaxURLLength <= 0 {
        errors = append(errors, "max URL length must be positive")
    }
    
    if len(errors) > 0 {
        return fmt.Errorf("configuration validation failed: %s", strings.Join(errors, "; "))
    }
    
    return nil
}
```

### 具体验证函数

```go
// IsValidPort 验证端口号是否有效
func (c *Config) IsValidPort() bool {
    portStr := strings.TrimPrefix(c.Port, ":")
    port, err := strconv.Atoi(portStr)
    if err != nil {
        return false
    }
    return port > 0 && port <= 65535
}

// IsValidBaseURL 验证基础 URL 是否有效
func (c *Config) IsValidBaseURL() bool {
    if c.BaseURL == "" {
        return false
    }
    
    // 简单的 URL 格式检查
    return strings.HasPrefix(c.BaseURL, "http://") || 
           strings.HasPrefix(c.BaseURL, "https://")
}

// IsValidLogLevel 验证日志级别是否有效
func (c *Config) IsValidLogLevel() bool {
    validLevels := []string{"debug", "info", "warn", "error"}
    for _, level := range validLevels {
        if c.LogLevel == level {
            return true
        }
    }
    return false
}
```

## 🔧 配置工具方法

### 端口处理

```go
// GetPort 获取端口号，确保格式正确
func (c *Config) GetPort() string {
    if strings.HasPrefix(c.Port, ":") {
        return c.Port
    }
    return ":" + c.Port
}

// GetAddress 获取完整的监听地址
func (c *Config) GetAddress() string {
    if c.Host == "" || c.Host == "localhost" {
        return c.GetPort()
    }
    return c.Host + c.GetPort()
}
```

### URL 处理

```go
// GetBaseURL 获取标准化的基础 URL
func (c *Config) GetBaseURL() string {
    return strings.TrimRight(c.BaseURL, "/")
}

// BuildShortURL 构建完整的短链接 URL
func (c *Config) BuildShortURL(shortCode string) string {
    return c.GetBaseURL() + "/" + shortCode
}
```

### 环境检测

```go
// IsDevelopment 检查是否为开发环境
func (c *Config) IsDevelopment() bool {
    return c.Debug || c.LogLevel == "debug"
}

// IsProduction 检查是否为生产环境
func (c *Config) IsProduction() bool {
    return !c.IsDevelopment()
}
```

## 🧪 配置测试

### 创建 config/config_test.go

```go
package config

import (
    "os"
    "testing"

    "github.com/stretchr/testify/assert"
)

func TestLoadConfig(t *testing.T) {
    // 测试默认配置
    config := LoadConfig()
    
    assert.Equal(t, "8080", config.Port)
    assert.Equal(t, "http://localhost:8080", config.BaseURL)
    assert.Equal(t, "info", config.LogLevel)
    assert.False(t, config.Debug)
}

func TestLoadConfigWithEnv(t *testing.T) {
    // 设置环境变量
    os.Setenv("PORT", "3000")
    os.Setenv("DEBUG", "true")
    os.Setenv("LOG_LEVEL", "debug")
    
    defer func() {
        os.Unsetenv("PORT")
        os.Unsetenv("DEBUG")
        os.Unsetenv("LOG_LEVEL")
    }()
    
    config := LoadConfig()
    
    assert.Equal(t, "3000", config.Port)
    assert.True(t, config.Debug)
    assert.Equal(t, "debug", config.LogLevel)
}

func TestConfigValidation(t *testing.T) {
    tests := []struct {
        name    string
        config  Config
        wantErr bool
    }{
        {
            name: "Valid config",
            config: Config{
                Port:         "8080",
                BaseURL:      "http://localhost:8080",
                LogLevel:     "info",
                MaxURLLength: 2048,
            },
            wantErr: false,
        },
        {
            name: "Invalid port",
            config: Config{
                Port:         "99999",
                BaseURL:      "http://localhost:8080",
                LogLevel:     "info",
                MaxURLLength: 2048,
            },
            wantErr: true,
        },
        {
            name: "Invalid log level",
            config: Config{
                Port:         "8080",
                BaseURL:      "http://localhost:8080",
                LogLevel:     "invalid",
                MaxURLLength: 2048,
            },
            wantErr: true,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := tt.config.Validate()
            if tt.wantErr {
                assert.Error(t, err)
            } else {
                assert.NoError(t, err)
            }
        })
    }
}
```

## 📊 配置监控

### 配置变更检测

```go
import (
    "crypto/md5"
    "fmt"
    "time"
)

// ConfigWatcher 配置文件监控器
type ConfigWatcher struct {
    filename string
    lastHash string
    callback func(*Config)
}

// NewConfigWatcher 创建配置监控器
func NewConfigWatcher(filename string, callback func(*Config)) *ConfigWatcher {
    return &ConfigWatcher{
        filename: filename,
        callback: callback,
    }
}

// Watch 开始监控配置文件变化
func (w *ConfigWatcher) Watch() {
    ticker := time.NewTicker(5 * time.Second)
    defer ticker.Stop()
    
    for range ticker.C {
        if w.hasChanged() {
            config := LoadConfigWithFile(w.filename)
            w.callback(config)
        }
    }
}

// hasChanged 检查配置文件是否发生变化
func (w *ConfigWatcher) hasChanged() bool {
    data, err := ioutil.ReadFile(w.filename)
    if err != nil {
        return false
    }
    
    hash := fmt.Sprintf("%x", md5.Sum(data))
    if hash != w.lastHash {
        w.lastHash = hash
        return true
    }
    
    return false
}
```

## 🔍 配置调试

### 配置信息输出

```go
// String 返回配置的字符串表示（隐藏敏感信息）
func (c *Config) String() string {
    return fmt.Sprintf("Config{Port:%s, Host:%s, BaseURL:%s, LogLevel:%s, Debug:%t}",
        c.Port, c.Host, c.BaseURL, c.LogLevel, c.Debug)
}

// PrintConfig 打印当前配置（用于调试）
func (c *Config) PrintConfig() {
    fmt.Println("Current Configuration:")
    fmt.Printf("  Port: %s\n", c.Port)
    fmt.Printf("  Host: %s\n", c.Host)
    fmt.Printf("  Base URL: %s\n", c.BaseURL)
    fmt.Printf("  Log Level: %s\n", c.LogLevel)
    fmt.Printf("  Debug: %t\n", c.Debug)
    fmt.Printf("  Max URL Length: %d\n", c.MaxURLLength)
    fmt.Printf("  Default TTL: %d\n", c.DefaultTTL)
}
```

## 📝 小结

本章我们实现了完整的配置管理系统：

1. **分层配置**：默认值 → 配置文件 → 环境变量
2. **多格式支持**：JSON 配置文件和环境变量
3. **配置验证**：确保配置的有效性
4. **工具方法**：便捷的配置访问和处理
5. **测试覆盖**：确保配置系统的可靠性

关键要点：
- 环境变量优先级最高，便于部署
- 配置验证防止无效配置导致的问题
- 工具方法简化配置的使用
- 完整测试确保配置系统稳定

下一章我们将实现存储层，提供数据持久化和并发安全的访问。
