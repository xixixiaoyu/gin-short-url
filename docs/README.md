# Gin URL Shortener 学习文档

本文档详细介绍了如何从零开始构建一个完整的短链接生成器服务，使用 Go 语言和 Gin 框架。

## 📚 文档目录

1. [项目概述与架构设计](./01-project-overview.md)
2. [项目初始化与依赖管理](./02-project-setup.md)
3. [Base62 编码算法实现](./03-base62-encoding.md)
4. [数据模型设计](./04-data-models.md)
5. [配置管理系统](./05-configuration.md)
6. [存储层实现](./06-storage-layer.md)
7. [业务逻辑服务层](./07-service-layer.md)
8. [HTTP 处理器实现](./08-handlers.md)
9. [路由配置与中间件](./09-routing-middleware.md)
10. [单元测试编写](./10-unit-testing.md)
11. [性能基准测试](./11-benchmarking.md)
12. [容器化部署](./12-containerization.md)
13. [项目工具与自动化](./13-tooling-automation.md)
14. [API 文档编写](./14-api-documentation.md)
15. [性能优化与最佳实践](./15-optimization-best-practices.md)

## 🎯 学习目标

通过本教程，您将学会：

- **Go 语言基础应用**：结构体、接口、并发安全
- **Gin 框架使用**：路由、中间件、JSON 处理
- **软件架构设计**：分层架构、依赖注入
- **测试驱动开发**：单元测试、基准测试、覆盖率
- **容器化部署**：Docker、Docker Compose
- **项目管理**：Makefile、文档编写
- **性能优化**：内存管理、并发处理

## 🏗 项目架构

```
┌─────────────────┐
│   HTTP Layer    │  ← handlers/
├─────────────────┤
│  Service Layer  │  ← services/
├─────────────────┤
│  Storage Layer  │  ← storage/
├─────────────────┤
│   Utils Layer   │  ← utils/
└─────────────────┘
```

## 🚀 快速开始

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd gin-url-shortener
   ```

2. **安装依赖**
   ```bash
   make install
   ```

3. **运行测试**
   ```bash
   make test
   ```

4. **启动服务**
   ```bash
   make run
   ```

## 📖 如何使用本文档

- **初学者**：按顺序阅读所有章节
- **有经验的开发者**：可以跳转到感兴趣的特定章节
- **实践学习**：每个章节都包含可执行的代码示例

## 🔧 前置要求

- Go 1.21+
- 基本的 HTTP 和 REST API 概念
- 基础的 Git 使用经验
- Docker（可选，用于容器化部署）

## 💡 学习建议

1. **边学边做**：跟着文档一步步实现代码
2. **理解原理**：不仅要知道怎么做，更要知道为什么这么做
3. **扩展思考**：思考如何改进和扩展现有功能
4. **实践应用**：尝试将学到的知识应用到其他项目中

开始您的学习之旅吧！🎉
