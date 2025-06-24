package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"gin-url-shortener/config"
	"gin-url-shortener/handlers"
	"gin-url-shortener/services"
	"gin-url-shortener/storage"
)

func main() {
	// 加载配置
	cfg := config.LoadConfig()

	// 验证配置
	if !cfg.IsValidPort() {
		log.Fatalf("Invalid port configuration: %s", cfg.Port)
	}

	// 初始化存储
	memStorage := storage.NewMemoryStorage()

	// 初始化服务
	urlService := services.NewURLService(memStorage, cfg)

	// 初始化处理器
	urlHandler := handlers.NewURLHandler(urlService)

	// 设置 Gin 模式
	if cfg.LogLevel == "debug" {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	// 创建 Gin 路由器
	router := gin.Default()

	// 添加中间件
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(corsMiddleware())

	// 注册路由
	setupRoutes(router, urlHandler)

	// 启动服务器
	log.Printf("Starting server on port %s", cfg.Port)
	log.Printf("Base URL: %s", cfg.BaseURL)
	
	if err := router.Run(cfg.GetPort()); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// setupRoutes 设置路由
func setupRoutes(router *gin.Engine, urlHandler *handlers.URLHandler) {
	// 添加根路径的欢迎信息（必须在通配符路由之前）
	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Welcome to Gin URL Shortener",
			"version": "1.0.0",
			"endpoints": gin.H{
				"shorten":     "POST /shorten",
				"redirect":    "GET /:shortCode",
				"info":        "GET /info/:shortCode",
				"health":      "GET /health",
			},
		})
	})

	// 健康检查
	router.GET("/health", urlHandler.HealthCheck)

	// 短链接相关 API
	router.POST("/shorten", urlHandler.ShortenURL)
	router.GET("/info/:shortCode", urlHandler.GetURLInfo)

	// 短链接重定向（放在最后，避免与其他路由冲突）
	router.GET("/:shortCode", urlHandler.RedirectURL)
}

// corsMiddleware CORS 中间件
func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
