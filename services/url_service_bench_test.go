package services

import (
	"fmt"
	"testing"

	"gin-url-shortener/config"
	"gin-url-shortener/storage"
)

func BenchmarkURLService_ShortenURL(b *testing.B) {
	// 设置测试环境
	memStorage := storage.NewMemoryStorage()
	cfg := &config.Config{
		BaseURL: "http://localhost:8080",
	}
	service := NewURLService(memStorage, cfg)

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

func BenchmarkURLService_GetOriginalURL(b *testing.B) {
	// 设置测试环境
	memStorage := storage.NewMemoryStorage()
	cfg := &config.Config{
		BaseURL: "http://localhost:8080",
	}
	service := NewURLService(memStorage, cfg)

	// 预先创建一些短链接
	shortCodes := make([]string, 1000)
	for i := 0; i < 1000; i++ {
		url := fmt.Sprintf("https://www.example%d.com", i)
		response, err := service.ShortenURL(url)
		if err != nil {
			b.Fatalf("Failed to create short URL: %v", err)
		}
		shortCodes[i] = response.ShortCode
	}

	b.ResetTimer()
	b.RunParallel(func(pb *testing.PB) {
		i := 0
		for pb.Next() {
			shortCode := shortCodes[i%len(shortCodes)]
			_, err := service.GetOriginalURL(shortCode)
			if err != nil {
				b.Errorf("GetOriginalURL failed: %v", err)
			}
			i++
		}
	})
}

func BenchmarkURLService_GetURLInfo(b *testing.B) {
	// 设置测试环境
	memStorage := storage.NewMemoryStorage()
	cfg := &config.Config{
		BaseURL: "http://localhost:8080",
	}
	service := NewURLService(memStorage, cfg)

	// 预先创建一些短链接
	shortCodes := make([]string, 100)
	for i := 0; i < 100; i++ {
		url := fmt.Sprintf("https://www.example%d.com", i)
		response, err := service.ShortenURL(url)
		if err != nil {
			b.Fatalf("Failed to create short URL: %v", err)
		}
		shortCodes[i] = response.ShortCode
	}

	b.ResetTimer()
	b.RunParallel(func(pb *testing.PB) {
		i := 0
		for pb.Next() {
			shortCode := shortCodes[i%len(shortCodes)]
			_, err := service.GetURLInfo(shortCode)
			if err != nil {
				b.Errorf("GetURLInfo failed: %v", err)
			}
			i++
		}
	})
}
