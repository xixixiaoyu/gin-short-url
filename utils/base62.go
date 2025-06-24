package utils

import (
	"strings"
)

const (
	// Base62 字符集：0-9, a-z, A-Z
	base62Chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	base        = 62
)

// EncodeBase62 将数字编码为 Base62 字符串
func EncodeBase62(num uint64) string {
	if num == 0 {
		return "0"
	}

	var result strings.Builder
	for num > 0 {
		result.WriteByte(base62Chars[num%base])
		num /= base
	}

	// 反转字符串
	encoded := result.String()
	runes := []rune(encoded)
	for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
		runes[i], runes[j] = runes[j], runes[i]
	}

	return string(runes)
}

// DecodeBase62 将 Base62 字符串解码为数字
func DecodeBase62(encoded string) uint64 {
	var result uint64
	power := uint64(1)

	// 从右到左处理字符
	for i := len(encoded) - 1; i >= 0; i-- {
		char := encoded[i]
		var value uint64

		switch {
		case char >= '0' && char <= '9':
			value = uint64(char - '0')
		case char >= 'a' && char <= 'z':
			value = uint64(char-'a') + 10
		case char >= 'A' && char <= 'Z':
			value = uint64(char-'A') + 36
		default:
			return 0 // 无效字符
		}

		result += value * power
		power *= base
	}

	return result
}

// IsValidBase62 检查字符串是否为有效的 Base62 编码
func IsValidBase62(s string) bool {
	if len(s) == 0 {
		return false
	}

	for _, char := range s {
		if !((char >= '0' && char <= '9') ||
			(char >= 'a' && char <= 'z') ||
			(char >= 'A' && char <= 'Z')) {
			return false
		}
	}
	return true
}
