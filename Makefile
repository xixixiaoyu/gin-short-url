.PHONY: help build run test clean docker-build docker-run docker-stop lint fmt vet

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

test-cover-html: ## 生成 HTML 格式的覆盖率报告
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html
	@echo "覆盖率报告已生成: coverage.html"

# 代码质量
fmt: ## 格式化代码
	go fmt ./...

vet: ## 运行 go vet
	go vet ./...

lint: ## 运行 golangci-lint (需要先安装)
	golangci-lint run

# Docker 相关
docker-build: ## 构建 Docker 镜像
	docker build -t gin-url-shortener .

docker-run: ## 运行 Docker 容器
	docker run -p 8080:8080 --name gin-url-shortener gin-url-shortener

docker-stop: ## 停止 Docker 容器
	docker stop gin-url-shortener || true
	docker rm gin-url-shortener || true

docker-compose-up: ## 使用 docker-compose 启动服务
	docker-compose up -d

docker-compose-down: ## 使用 docker-compose 停止服务
	docker-compose down

# 清理
clean: ## 清理构建文件
	rm -f bin/gin-url-shortener
	rm -f coverage.out coverage.html
	go clean

# 开发相关
dev: ## 开发模式运行（带热重载，需要安装 air）
	air

# 性能测试
benchmark: ## 运行基准测试
	go test -bench=. -benchmem ./...

# 安全检查
security: ## 运行安全检查 (需要安装 gosec)
	gosec ./...
