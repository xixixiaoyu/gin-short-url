# Gin URL Shortener

一个使用 Go 语言和 Gin 框架构建的高性能短链接生成器服务。

## 功能特性

- **短链接生成**：将长 URL 转换为简短易记的链接
- **智能重定向**：访问短链接时自动跳转到原始 URL
- **访问统计**：记录每个短链接的访问次数
- **链接管理**：查询短链接的详细信息
- **高性能**：基于内存存储，响应速度快
- **RESTful API**：标准的 HTTP API 接口
- **参数验证**：完整的输入验证和错误处理
- **单元测试**：全面的测试覆盖

## 技术栈

- **Go 1.21+**
- **Gin Web Framework**
- **Base62 编码算法**
- **内存存储 (可扩展为数据库)**
- **JSON API**

## 快速开始

### 安装依赖

```bash
go mod tidy
```

### 运行服务

```bash
go run main.go
```

服务将在 `http://localhost:8080` 启动。

### 环境变量配置

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `PORT` | `8080` | 服务端口 |
| `BASE_URL` | `http://localhost:8080` | 基础 URL，用于生成完整短链接 |
| `LOG_LEVEL` | `info` | 日志级别 (debug/info) |

示例：
```bash
export PORT=3000
export BASE_URL=https://short.ly
export LOG_LEVEL=debug
go run main.go
```

## API 接口

### 1. 创建短链接

**POST** `/shorten`

请求体：
```json
{
  "url": "https://www.example.com/very/long/url/path"
}
```

响应：
```json
{
  "id": 1,
  "original_url": "https://www.example.com/very/long/url/path",
  "short_code": "1",
  "short_url": "http://localhost:8080/1",
  "created_at": "2025-06-24T10:30:00Z"
}
```

### 2. 短链接重定向

**GET** `/:shortCode`

访问短链接会自动重定向到原始 URL，并增加访问计数。

### 3. 查询链接信息

**GET** `/info/:shortCode`

响应：
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

### 4. 健康检查

**GET** `/health`

响应：
```json
{
  "status": "ok",
  "service": "gin-url-shortener"
}
```

### 5. 服务信息

**GET** `/`

响应：
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

## 使用示例

### 使用 curl

```bash
# 创建短链接
curl -X POST http://localhost:8080/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.google.com"}'

# 查询链接信息
curl http://localhost:8080/info/1

# 访问短链接（会重定向）
curl -L http://localhost:8080/1
```

### 使用 JavaScript

```javascript
// 创建短链接
const response = await fetch('http://localhost:8080/shorten', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://www.example.com'
  })
});

const data = await response.json();
console.log('短链接:', data.short_url);
```

## 运行测试

```bash
# 运行所有测试
go test ./...

# 运行测试并显示覆盖率
go test -cover ./...

# 运行特定包的测试
go test ./utils
go test ./services
go test ./handlers
```

## 项目结构

```
gin-url-shortener/
├── main.go                 # 程序入口
├── go.mod                  # 依赖管理
├── README.md              # 项目文档
├── config/
│   └── config.go          # 配置管理
├── models/
│   └── url.go             # 数据模型
├── storage/
│   └── memory_storage.go  # 内存存储实现
├── services/
│   ├── url_service.go     # 业务逻辑服务
│   └── url_service_test.go # 服务层测试
├── handlers/
│   ├── url_handler.go     # HTTP 处理器
│   └── url_handler_test.go # 处理器测试
└── utils/
    ├── base62.go          # Base62 编码工具
    └── base62_test.go     # 编码工具测试
```

## 设计特点

### Base62 编码
- 使用 0-9, a-z, A-Z 共 62 个字符
- 生成的短码简洁且 URL 友好
- 基于递增 ID 确保唯一性

### 错误处理
- 完整的参数验证
- 标准化的错误响应格式
- 详细的错误信息

### 并发安全
- 使用读写锁保护内存存储
- 支持高并发访问

### 可扩展性
- 模块化设计，易于扩展
- 存储层抽象，可轻松替换为数据库
- 配置化管理

## 性能特点

- **高性能**：基于内存存储，毫秒级响应
- **低延迟**：直接内存查找，无数据库 I/O
- **高并发**：Gin 框架原生支持高并发
- **轻量级**：单文件部署，资源占用少

## 部署建议

### Docker 部署

创建 `Dockerfile`：
```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod tidy && go build -o gin-url-shortener

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/gin-url-shortener .
EXPOSE 8080
CMD ["./gin-url-shortener"]
```

### 生产环境配置

```bash
export PORT=80
export BASE_URL=https://yourdomain.com
export LOG_LEVEL=info
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
