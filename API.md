# Gin URL Shortener API 文档

## 概述

Gin URL Shortener 是一个高性能的短链接生成服务，提供 RESTful API 接口。

**基础 URL**: `http://localhost:8080`

## 认证

当前版本不需要认证。

## 错误处理

所有错误响应都遵循统一格式：

```json
{
  "error": "error_code",
  "message": "详细错误信息"
}
```

### 常见错误码

| 错误码 | HTTP 状态码 | 描述 |
|--------|-------------|------|
| `invalid_request` | 400 | 请求参数无效 |
| `invalid_url` | 400 | URL 格式无效 |
| `invalid_short_code` | 400 | 短码格式无效 |
| `url_not_found` | 404 | 短链接不存在 |
| `internal_error` | 500 | 服务器内部错误 |

## API 端点

### 1. 服务信息

#### GET /

获取服务基本信息和可用端点。

**响应示例**:
```json
{
  "message": "Welcome to Gin URL Shortener",
  "version": "1.0.0",
  "endpoints": {
    "shorten": "POST /shorten",
    "redirect": "GET /:shortCode",
    "info": "GET /info/:shortCode",
    "health": "GET /health"
  }
}
```

### 2. 健康检查

#### GET /health

检查服务健康状态。

**响应示例**:
```json
{
  "status": "ok",
  "service": "gin-url-shortener"
}
```

### 3. 创建短链接

#### POST /shorten

将长 URL 转换为短链接。

**请求体**:
```json
{
  "url": "https://www.example.com/very/long/url/path"
}
```

**请求参数**:
| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `url` | string | 是 | 要缩短的原始 URL，必须是有效的 HTTP/HTTPS URL |

**响应示例**:
```json
{
  "id": 1,
  "original_url": "https://www.example.com/very/long/url/path",
  "short_code": "1",
  "short_url": "http://localhost:8080/1",
  "created_at": "2025-06-24T10:30:00Z"
}
```

**响应字段**:
| 字段 | 类型 | 描述 |
|------|------|------|
| `id` | number | 唯一标识符 |
| `original_url` | string | 原始 URL |
| `short_code` | string | 短链接代码 |
| `short_url` | string | 完整的短链接 URL |
| `created_at` | string | 创建时间 (ISO 8601) |

**错误响应**:
- `400 Bad Request`: URL 格式无效或缺少必填参数
- `500 Internal Server Error`: 服务器内部错误

### 4. 短链接重定向

#### GET /:shortCode

访问短链接，自动重定向到原始 URL。

**路径参数**:
| 参数 | 类型 | 描述 |
|------|------|------|
| `shortCode` | string | 短链接代码 |

**响应**:
- `301 Moved Permanently`: 重定向到原始 URL
- `404 Not Found`: 短链接不存在
- `400 Bad Request`: 短码格式无效

**注意**: 每次访问都会增加该短链接的访问计数。

### 5. 查询短链接信息

#### GET /info/:shortCode

获取短链接的详细信息，包括访问统计。

**路径参数**:
| 参数 | 类型 | 描述 |
|------|------|------|
| `shortCode` | string | 短链接代码 |

**响应示例**:
```json
{
  "id": 1,
  "original_url": "https://www.example.com/very/long/url/path",
  "short_code": "1",
  "short_url": "http://localhost:8080/1",
  "created_at": "2025-06-24T10:30:00Z",
  "access_count": 5
}
```

**响应字段**:
| 字段 | 类型 | 描述 |
|------|------|------|
| `id` | number | 唯一标识符 |
| `original_url` | string | 原始 URL |
| `short_code` | string | 短链接代码 |
| `short_url` | string | 完整的短链接 URL |
| `created_at` | string | 创建时间 (ISO 8601) |
| `access_count` | number | 访问次数 |

**错误响应**:
- `404 Not Found`: 短链接不存在
- `400 Bad Request`: 短码格式无效

## 使用示例

### cURL 示例

```bash
# 创建短链接
curl -X POST http://localhost:8080/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.google.com"}'

# 查询链接信息
curl http://localhost:8080/info/1

# 访问短链接（会重定向）
curl -L http://localhost:8080/1

# 健康检查
curl http://localhost:8080/health
```

### JavaScript 示例

```javascript
// 创建短链接
async function createShortUrl(originalUrl) {
  const response = await fetch('http://localhost:8080/shorten', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: originalUrl })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

// 查询链接信息
async function getUrlInfo(shortCode) {
  const response = await fetch(`http://localhost:8080/info/${shortCode}`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

// 使用示例
createShortUrl('https://www.example.com')
  .then(data => console.log('短链接:', data.short_url))
  .catch(error => console.error('错误:', error));
```

### Python 示例

```python
import requests
import json

# 创建短链接
def create_short_url(original_url):
    url = "http://localhost:8080/shorten"
    payload = {"url": original_url}
    headers = {"Content-Type": "application/json"}
    
    response = requests.post(url, data=json.dumps(payload), headers=headers)
    response.raise_for_status()
    return response.json()

# 查询链接信息
def get_url_info(short_code):
    url = f"http://localhost:8080/info/{short_code}"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()

# 使用示例
try:
    result = create_short_url("https://www.example.com")
    print(f"短链接: {result['short_url']}")
    
    info = get_url_info(result['short_code'])
    print(f"访问次数: {info['access_count']}")
except requests.exceptions.RequestException as e:
    print(f"错误: {e}")
```

## 限制和注意事项

1. **URL 格式**: 只支持 HTTP 和 HTTPS 协议的 URL
2. **短码格式**: 使用 Base62 编码 (0-9, a-z, A-Z)
3. **存储**: 当前使用内存存储，服务重启后数据会丢失
4. **并发**: 支持高并发访问，使用读写锁保护数据
5. **重复 URL**: 相同的原始 URL 会返回相同的短链接
6. **访问统计**: 每次通过短链接访问都会增加计数

## 性能特点

- **响应时间**: 毫秒级响应
- **并发处理**: 支持高并发请求
- **内存使用**: 轻量级内存存储
- **吞吐量**: 单机可处理数千 QPS

## 配置选项

通过环境变量配置服务：

| 变量名 | 默认值 | 描述 |
|--------|--------|------|
| `PORT` | `8080` | 服务端口 |
| `BASE_URL` | `http://localhost:8080` | 基础 URL |
| `LOG_LEVEL` | `info` | 日志级别 |
