package config

import (
	"os"
	"strconv"
)

// Config 应用配置结构
type Config struct {
	Port     string // 服务端口
	BaseURL  string // 基础 URL，用于生成完整的短链接
	LogLevel string // 日志级别
}

// LoadConfig 加载配置，支持环境变量覆盖默认值
func LoadConfig() *Config {
	config := &Config{
		Port:     "8080",
		BaseURL:  "http://localhost:8080",
		LogLevel: "info",
	}

	// 从环境变量读取配置
	if port := os.Getenv("PORT"); port != "" {
		config.Port = port
	}

	if baseURL := os.Getenv("BASE_URL"); baseURL != "" {
		config.BaseURL = baseURL
	}

	if logLevel := os.Getenv("LOG_LEVEL"); logLevel != "" {
		config.LogLevel = logLevel
	}

	return config
}

// GetPort 获取端口号，确保格式正确
func (c *Config) GetPort() string {
	if c.Port[0] != ':' {
		return ":" + c.Port
	}
	return c.Port
}

// IsValidPort 验证端口号是否有效
func (c *Config) IsValidPort() bool {
	portStr := c.Port
	if portStr[0] == ':' {
		portStr = portStr[1:]
	}
	
	port, err := strconv.Atoi(portStr)
	if err != nil {
		return false
	}
	
	return port > 0 && port <= 65535
}
