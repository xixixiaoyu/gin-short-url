# 第3章：Base62 编码算法实现

## 🎯 本章目标

学习并实现 Base62 编码算法，这是短链接生成的核心技术：
- 理解 Base62 编码原理
- 实现编码和解码函数
- 编写完整的单元测试
- 性能优化和边界处理

## 🔢 Base62 编码原理

### 什么是 Base62？

Base62 是一种基于 62 个字符的编码系统，使用以下字符集：
- 数字：`0-9` (10 个字符)
- 小写字母：`a-z` (26 个字符)  
- 大写字母：`A-Z` (26 个字符)

总计：10 + 26 + 26 = 62 个字符

### 为什么选择 Base62？

| 编码方式 | 字符集大小 | URL 友好 | 短码长度 | 适用场景 |
|----------|------------|----------|----------|----------|
| Base10 | 10 | ✅ | 长 | 简单数字 |
| Base16 | 16 | ✅ | 中等 | 十六进制 |
| Base64 | 64 | ❌ | 短 | 数据编码 |
| **Base62** | 62 | ✅ | 短 | **URL 短链接** |

Base62 的优势：
1. **URL 友好**：不包含 `+`、`/`、`=` 等特殊字符
2. **短码简洁**：比 Base10 更短，比 Base64 更安全
3. **可读性好**：避免了容易混淆的字符组合

### 编码原理

Base62 编码本质上是进制转换：

```
十进制数 → Base62 字符串

例如：
125 (十进制) → "21" (Base62)

计算过程：
125 ÷ 62 = 2 余 1  → 字符 '1'
2 ÷ 62 = 0 余 2    → 字符 '2'

结果：'2' + '1' = "21"
```

## 💻 实现 Base62 编码器

### 创建 utils/base62.go

```go
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
```

### 实现解码函数

```go
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
```

### 添加验证函数

```go
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
```

## 🧪 编写单元测试

### 创建 utils/base62_test.go

```go
package utils

import (
    "testing"

    "github.com/stretchr/testify/assert"
)

func TestEncodeBase62(t *testing.T) {
    tests := []struct {
        input    uint64
        expected string
    }{
        {0, "0"},
        {1, "1"},
        {10, "a"},
        {35, "z"},
        {36, "A"},
        {61, "Z"},
        {62, "10"},
        {123, "1Z"},
        {3844, "100"}, // 62^2
    }

    for _, test := range tests {
        result := EncodeBase62(test.input)
        assert.Equal(t, test.expected, result, 
            "EncodeBase62(%d) should return %s", test.input, test.expected)
    }
}

func TestDecodeBase62(t *testing.T) {
    tests := []struct {
        input    string
        expected uint64
    }{
        {"0", 0},
        {"1", 1},
        {"a", 10},
        {"z", 35},
        {"A", 36},
        {"Z", 61},
        {"10", 62},
        {"1Z", 123},
        {"100", 3844},
    }

    for _, test := range tests {
        result := DecodeBase62(test.input)
        assert.Equal(t, test.expected, result, 
            "DecodeBase62(%s) should return %d", test.input, test.expected)
    }
}
```

### 往返测试（Round-trip Test）

```go
func TestBase62RoundTrip(t *testing.T) {
    testValues := []uint64{0, 1, 10, 62, 123, 1000, 3844, 999999}

    for _, value := range testValues {
        encoded := EncodeBase62(value)
        decoded := DecodeBase62(encoded)
        assert.Equal(t, value, decoded, 
            "Round trip failed for value %d", value)
    }
}
```

### 验证函数测试

```go
func TestIsValidBase62(t *testing.T) {
    validCases := []string{
        "0", "1", "a", "z", "A", "Z", "10", "1Z", "abc123XYZ",
    }

    for _, test := range validCases {
        assert.True(t, IsValidBase62(test), 
            "%s should be valid Base62", test)
    }

    invalidCases := []string{
        "", "!", "@", "#", "abc!", "123@", "test-case",
    }

    for _, test := range invalidCases {
        assert.False(t, IsValidBase62(test), 
            "%s should be invalid Base62", test)
    }
}
```

## 🚀 运行测试

```bash
# 运行 Base62 测试
go test ./utils -v

# 运行测试并查看覆盖率
go test ./utils -cover

# 生成详细的覆盖率报告
go test ./utils -coverprofile=coverage.out
go tool cover -html=coverage.out
```

预期输出：
```
=== RUN   TestEncodeBase62
--- PASS: TestEncodeBase62 (0.00s)
=== RUN   TestDecodeBase62
--- PASS: TestDecodeBase62 (0.00s)
=== RUN   TestBase62RoundTrip
--- PASS: TestBase62RoundTrip (0.00s)
=== RUN   TestIsValidBase62
--- PASS: TestIsValidBase62 (0.00s)
PASS
coverage: 96.7% of statements
```

## ⚡ 性能优化

### 字符串构建优化

使用 `strings.Builder` 而不是字符串拼接：

```go
// ❌ 低效的方式
func encodeBase62Slow(num uint64) string {
    result := ""
    for num > 0 {
        result = string(base62Chars[num%base]) + result // 每次都创建新字符串
        num /= base
    }
    return result
}

// ✅ 高效的方式
func EncodeBase62(num uint64) string {
    var result strings.Builder
    result.Grow(10) // 预分配容量
    
    for num > 0 {
        result.WriteByte(base62Chars[num%base])
        num /= base
    }
    
    // 反转字符串
    encoded := result.String()
    return reverseString(encoded)
}
```

### 查找表优化

对于解码，可以使用查找表提高性能：

```go
var base62DecodeMap = make(map[byte]uint64)

func init() {
    for i, char := range base62Chars {
        base62DecodeMap[byte(char)] = uint64(i)
    }
}

// 优化后的解码函数
func DecodeBase62Fast(encoded string) uint64 {
    var result uint64
    power := uint64(1)

    for i := len(encoded) - 1; i >= 0; i-- {
        if value, ok := base62DecodeMap[encoded[i]]; ok {
            result += value * power
            power *= base
        } else {
            return 0 // 无效字符
        }
    }

    return result
}
```

## 📊 性能基准测试

### 创建基准测试

```go
func BenchmarkEncodeBase62(b *testing.B) {
    for i := 0; i < b.N; i++ {
        EncodeBase62(uint64(i))
    }
}

func BenchmarkDecodeBase62(b *testing.B) {
    encoded := EncodeBase62(123456)
    b.ResetTimer()
    
    for i := 0; i < b.N; i++ {
        DecodeBase62(encoded)
    }
}

func BenchmarkBase62RoundTrip(b *testing.B) {
    for i := 0; i < b.N; i++ {
        encoded := EncodeBase62(uint64(i))
        DecodeBase62(encoded)
    }
}
```

运行基准测试：
```bash
go test ./utils -bench=. -benchmem
```

## 🔍 边界情况处理

### 输入验证

```go
func EncodeBase62Safe(num uint64) (string, error) {
    if num > math.MaxUint64 {
        return "", errors.New("number too large")
    }
    return EncodeBase62(num), nil
}

func DecodeBase62Safe(encoded string) (uint64, error) {
    if !IsValidBase62(encoded) {
        return 0, errors.New("invalid Base62 string")
    }
    
    if len(encoded) > 11 { // uint64 最大值的 Base62 长度
        return 0, errors.New("string too long")
    }
    
    return DecodeBase62(encoded), nil
}
```

### 空值处理

```go
func TestEdgeCases(t *testing.T) {
    // 测试零值
    assert.Equal(t, "0", EncodeBase62(0))
    assert.Equal(t, uint64(0), DecodeBase62("0"))
    
    // 测试最大值
    maxUint64 := uint64(18446744073709551615)
    encoded := EncodeBase62(maxUint64)
    decoded := DecodeBase62(encoded)
    assert.Equal(t, maxUint64, decoded)
    
    // 测试空字符串
    assert.False(t, IsValidBase62(""))
    assert.Equal(t, uint64(0), DecodeBase62(""))
}
```

## 📈 算法复杂度分析

### 时间复杂度

- **编码**：O(log₆₂ n) ≈ O(log n)
- **解码**：O(m)，其中 m 是字符串长度
- **验证**：O(m)，其中 m 是字符串长度

### 空间复杂度

- **编码**：O(log₆₂ n) 用于存储结果
- **解码**：O(1) 常数空间
- **验证**：O(1) 常数空间

### 性能对比

| 操作 | Base62 | Base64 | Base10 |
|------|--------|--------|--------|
| 编码速度 | 快 | 最快 | 中等 |
| 解码速度 | 快 | 最快 | 中等 |
| 短码长度 | 短 | 最短 | 长 |
| URL 友好 | ✅ | ❌ | ✅ |

## 📝 小结

本章我们实现了完整的 Base62 编码系统：

1. **核心算法**：编码、解码、验证函数
2. **测试覆盖**：单元测试、往返测试、边界测试
3. **性能优化**：字符串构建、查找表优化
4. **错误处理**：输入验证、边界情况

关键要点：
- Base62 是 URL 短链接的理想编码方式
- 使用 `strings.Builder` 提高字符串操作性能
- 完整的测试确保算法正确性
- 边界情况处理提高代码健壮性

下一章我们将设计数据模型，定义系统中的核心数据结构。
