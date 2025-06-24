package storage

import (
	"fmt"
	"testing"
)

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

func BenchmarkMemoryStorage_IncrementAccessCount(b *testing.B) {
	storage := NewMemoryStorage()

	// 预先保存一些 URL
	shortCodes := make([]string, 100)
	for i := 0; i < 100; i++ {
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
			err := storage.IncrementAccessCount(shortCode)
			if err != nil {
				b.Errorf("IncrementAccessCount failed: %v", err)
			}
			i++
		}
	})
}
