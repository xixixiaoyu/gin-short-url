# 第2章：项目初始化与依赖管理

## 🎯 本章目标

学习如何从零开始创建一个 Go 项目，包括：
- 项目结构设计
- Go Modules 依赖管理
- 开发工具配置
- 基础文件创建

## 📁 项目结构设计

### 标准 Go 项目布局

我们采用 Go 社区推荐的标准项目布局：

```
gin-url-shortener/
├── main.go                 # 程序入口点
├── go.mod                  # Go 模块定义
├── go.sum                  # 依赖校验文件
├── README.md              # 项目说明文档
├── Makefile               # 构建自动化
├── Dockerfile             # 容器化配置
├── docker-compose.yml     # 容器编排
├── .gitignore             # Git 忽略文件
├── config/                # 配置管理
│   └── config.go
├── models/                # 数据模型
│   └── url.go
├── storage/               # 存储层
│   ├── memory_storage.go
│   └── memory_storage_bench_test.go
├── services/              # 业务逻辑层
│   ├── url_service.go
│   ├── url_service_test.go
│   └── url_service_bench_test.go
├── handlers/              # HTTP 处理层
│   ├── url_handler.go
│   └── url_handler_test.go
├── utils/                 # 工具函数
│   ├── base62.go
│   └── base62_test.go
└── docs/                  # 项目文档
    ├── README.md
    └── API.md
```

### 目录职责说明

| 目录 | 职责 | 命名规范 |
|------|------|----------|
| `config/` | 配置管理和环境变量处理 | 小写，描述性名称 |
| `models/` | 数据结构定义和验证 | 单数形式，如 `user.go` |
| `storage/` | 数据访问层，抽象存储操作 | 存储类型 + storage |
| `services/` | 业务逻辑层，核心算法实现 | 业务域 + service |
| `handlers/` | HTTP 请求处理，路由绑定 | 资源名 + handler |
| `utils/` | 通用工具函数，无业务逻辑 | 功能描述性名称 |

## 🚀 项目初始化步骤

### 步骤 1：创建项目目录

```bash
# 创建项目根目录
mkdir gin-url-shortener
cd gin-url-shortener

# 创建子目录
mkdir -p config models storage services handlers utils docs
```

### 步骤 2：初始化 Go 模块

```bash
# 初始化 Go 模块
go mod init gin-url-shortener

# 查看生成的 go.mod 文件
cat go.mod
```

生成的 `go.mod` 文件：
```go
module gin-url-shortener

go 1.21
```

### 步骤 3：添加核心依赖

```bash
# 添加 Gin 框架
go get github.com/gin-gonic/gin@v1.9.1

# 添加测试框架
go get github.com/stretchr/testify@v1.8.4
```

## 📦 依赖管理详解

### go.mod 文件结构

```go
module gin-url-shortener

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1
    github.com/stretchr/testify v1.8.4
)

require (
    // 间接依赖会自动添加到这里
    github.com/bytedance/sonic v1.9.1 // indirect
    github.com/chenzhuoyu/base64x v0.0.0-20221115062448-fe3a3abad311 // indirect
    // ... 更多间接依赖
)
```

### 依赖管理命令

```bash
# 下载依赖
go mod download

# 整理依赖（移除未使用的依赖）
go mod tidy

# 查看依赖图
go mod graph

# 查看特定模块信息
go list -m github.com/gin-gonic/gin

# 升级依赖到最新版本
go get -u github.com/gin-gonic/gin

# 升级所有依赖
go get -u ./...
```

### 版本管理策略

| 版本格式 | 示例 | 说明 |
|----------|------|------|
| 精确版本 | `v1.9.1` | 锁定特定版本 |
| 主版本 | `v1` | 最新的 v1.x.x |
| 最新版本 | `latest` | 最新发布版本 |
| 提交哈希 | `v0.0.0-20220101120000-abcdef123456` | 特定提交 |

## 🔧 开发工具配置

### 创建 .gitignore 文件

```gitignore
# Go 相关
*.exe
*.exe~
*.dll
*.so
*.dylib
*.test
*.out
go.work

# 构建输出
bin/
dist/
build/

# 依赖目录
vendor/

# IDE 相关
.vscode/
.idea/
*.swp
*.swo
*~

# 操作系统相关
.DS_Store
Thumbs.db

# 日志和临时文件
*.log
*.tmp
*.temp

# 覆盖率报告
coverage.out
coverage.html

# 环境变量文件
.env
.env.local
```

### 创建 Makefile

```makefile
.PHONY: help build run test clean

# 默认目标
help: ## 显示帮助信息
	@echo "可用的命令："
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

# 构建相关
build: ## 构建应用
	go build -o bin/gin-url-shortener .

run: ## 运行应用
	go run main.go

install: ## 安装依赖
	go mod tidy
	go mod download

# 测试相关
test: ## 运行所有测试
	go test -v ./...

test-cover: ## 运行测试并生成覆盖率报告
	go test -v -cover ./...

# 代码质量
fmt: ## 格式化代码
	go fmt ./...

vet: ## 运行 go vet
	go vet ./...

# 清理
clean: ## 清理构建文件
	rm -f bin/gin-url-shortener
	rm -f coverage.out coverage.html
	go clean
```

## 📝 基础文件创建

### 创建 main.go 骨架

```go
package main

import (
    "log"
    "net/http"

    "github.com/gin-gonic/gin"
)

func main() {
    // 创建 Gin 路由器
    router := gin.Default()

    // 添加基本路由
    router.GET("/", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "message": "Welcome to Gin URL Shortener",
            "version": "1.0.0",
        })
    })

    // 启动服务器
    log.Println("Starting server on :8080")
    if err := router.Run(":8080"); err != nil {
        log.Fatalf("Failed to start server: %v", err)
    }
}
```

### 验证项目设置

```bash
# 运行项目
go run main.go

# 在另一个终端测试
curl http://localhost:8080/
```

预期输出：
```json
{
  "message": "Welcome to Gin URL Shortener",
  "version": "1.0.0"
}
```

## 🔍 依赖分析

### Gin 框架核心依赖

```bash
# 查看 Gin 的依赖树
go mod graph | grep gin-gonic
```

主要间接依赖：
- `github.com/bytedance/sonic` - 高性能 JSON 序列化
- `github.com/go-playground/validator/v10` - 参数验证
- `github.com/gin-contrib/sse` - Server-Sent Events 支持

### 依赖安全检查

```bash
# 检查已知漏洞
go list -json -m all | nancy sleuth

# 或使用 govulncheck（Go 1.18+）
go install golang.org/x/vuln/cmd/govulncheck@latest
govulncheck ./...
```

## 🚀 项目验证

### 运行基础测试

```bash
# 创建简单测试文件
cat > main_test.go << 'EOF'
package main

import (
    "net/http"
    "net/http/httptest"
    "testing"

    "github.com/gin-gonic/gin"
    "github.com/stretchr/testify/assert"
)

func TestMainRoute(t *testing.T) {
    gin.SetMode(gin.TestMode)
    
    router := gin.Default()
    router.GET("/", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "message": "Welcome to Gin URL Shortener",
            "version": "1.0.0",
        })
    })

    w := httptest.NewRecorder()
    req, _ := http.NewRequest("GET", "/", nil)
    router.ServeHTTP(w, req)

    assert.Equal(t, http.StatusOK, w.Code)
    assert.Contains(t, w.Body.String(), "Welcome to Gin URL Shortener")
}
EOF

# 运行测试
go test -v
```

### 检查项目健康状态

```bash
# 检查代码格式
go fmt ./...

# 运行静态分析
go vet ./...

# 检查依赖
go mod verify
```

## 📊 项目指标

### 初始项目统计

```bash
# 代码行数统计
find . -name "*.go" | xargs wc -l

# 依赖数量
go list -m all | wc -l

# 包大小
go build -o bin/app . && ls -lh bin/app
```

## 🎯 最佳实践

### 1. 模块命名
- 使用描述性的模块名
- 避免通用名称如 `app`、`main`
- 考虑未来的包发布

### 2. 依赖管理
- 定期更新依赖
- 使用 `go mod tidy` 清理
- 锁定关键依赖版本

### 3. 项目结构
- 保持目录结构简洁
- 按功能而非技术分层
- 遵循 Go 社区约定

### 4. 版本控制
- 提交前运行测试
- 使用有意义的提交信息
- 定期创建发布标签

## 📝 小结

本章我们完成了：

1. **项目结构设计**：建立了清晰的目录结构
2. **依赖管理**：配置了 Go Modules 和核心依赖
3. **开发工具**：创建了 Makefile 和配置文件
4. **基础验证**：确保项目可以正常运行

关键要点：
- 标准的 Go 项目布局提高可维护性
- Go Modules 提供了强大的依赖管理
- Makefile 简化了常用操作
- 早期验证确保项目基础正确

下一章我们将实现 Base62 编码算法，这是短链接生成的核心组件。

## 🔗 相关资源

- [Go Modules 官方文档](https://golang.org/ref/mod)
- [Gin 框架文档](https://gin-gonic.com/docs/)
- [Go 项目布局标准](https://github.com/golang-standards/project-layout)
- [Makefile 教程](https://makefiletutorial.com/)
