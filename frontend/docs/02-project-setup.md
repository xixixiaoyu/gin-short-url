# 第2章：项目初始化与环境配置

## 🎯 本章目标

学习如何从零开始创建一个 Next.js + TypeScript 项目：
- 项目初始化和依赖管理
- 开发环境配置
- 代码质量工具配置
- 基础文件结构搭建

## 🚀 项目初始化

### 方法一：使用 create-next-app

```bash
# 创建 Next.js 项目
npx create-next-app@latest url-shortener-frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 进入项目目录
cd url-shortener-frontend
```

### 方法二：手动初始化

```bash
# 创建项目目录
mkdir url-shortener-frontend
cd url-shortener-frontend

# 初始化 package.json
npm init -y

# 安装 Next.js 和 React
npm install next@latest react@latest react-dom@latest

# 安装 TypeScript
npm install -D typescript @types/react @types/node

# 安装 Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### package.json 配置

```json
{
  "name": "url-shortener-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.2.2"
  },
  "devDependencies": {
    "@types/node": "^20.8.0",
    "@types/react": "^18.2.25",
    "@types/react-dom": "^18.2.11",
    "eslint": "^8.51.0",
    "eslint-config-next": "14.0.0",
    "tailwindcss": "^3.3.5",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31"
  }
}
```

## ⚙️ 配置文件设置

### TypeScript 配置 (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/utils/*": ["./src/utils/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Next.js 配置 (next.config.js)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 环境变量配置
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  },
  
  // API 代理配置（开发环境）
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/:path*`,
      },
    ];
  },
  
  // 图片优化配置
  images: {
    domains: ['localhost'],
  },
  
  // 实验性功能
  experimental: {
    typedRoutes: true,
  },
};

module.exports = nextConfig;
```

### Tailwind CSS 配置 (tailwind.config.js)

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

### PostCSS 配置 (postcss.config.js)

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

## 🔧 代码质量工具配置

### ESLint 配置 (.eslintrc.json)

```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-empty-function": "warn",
    "prefer-const": "error",
    "no-var": "error",
    "no-console": "warn",
    "eqeqeq": "error",
    "curly": "error"
  },
  "env": {
    "browser": true,
    "node": true,
    "es6": true
  }
}
```

### Prettier 配置 (.prettierrc)

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### Git 忽略文件 (.gitignore)

```gitignore
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
Thumbs.db
```

## 📁 基础目录结构

### 创建目录结构

```bash
# 创建 src 目录结构
mkdir -p src/{components/{ui},pages,hooks,lib,types,utils,styles}

# 创建其他目录
mkdir -p public docs __tests__
```

### 目录结构说明

```
frontend/
├── src/                    # 源代码目录
│   ├── components/         # 组件目录
│   │   ├── ui/            # 基础 UI 组件
│   │   ├── URLShortener.tsx
│   │   ├── URLList.tsx
│   │   └── Layout.tsx
│   ├── pages/             # 页面组件 (Pages Router)
│   │   ├── _app.tsx       # 应用入口
│   │   ├── _document.tsx  # 文档结构
│   │   ├── index.tsx      # 首页
│   │   ├── manage.tsx     # 管理页
│   │   └── analytics.tsx  # 统计页
│   ├── hooks/             # 自定义 Hooks
│   │   └── useAPI.ts
│   ├── lib/               # 核心库文件
│   │   └── api.ts         # API 客户端
│   ├── types/             # TypeScript 类型定义
│   │   └── api.ts
│   ├── utils/             # 工具函数
│   │   └── index.ts
│   └── styles/            # 样式文件
│       └── globals.css
├── public/                # 静态资源
│   ├── favicon.ico
│   └── images/
├── __tests__/             # 测试文件
├── docs/                  # 项目文档
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
├── next.config.js         # Next.js 配置
├── tailwind.config.js     # Tailwind 配置
└── README.md              # 项目说明
```

## 🎨 基础样式设置

### 全局样式 (src/styles/globals.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 自定义 CSS 变量 */
:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

/* 基础样式重置 */
* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 自定义动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 工具类 */
.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}
```

## 🌍 环境变量配置

### 环境变量文件

创建 `.env.local.example`：

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# Development Configuration
NODE_ENV=development

# Optional: Analytics Configuration
# NEXT_PUBLIC_GA_ID=your-google-analytics-id

# Optional: Error Tracking
# NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### 环境变量使用

```typescript
// 在组件中使用环境变量
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// 类型安全的环境变量
interface EnvironmentConfig {
  apiBaseUrl: string;
  nodeEnv: string;
  gaId?: string;
}

const config: EnvironmentConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  nodeEnv: process.env.NODE_ENV || 'development',
  gaId: process.env.NEXT_PUBLIC_GA_ID,
};
```

## 🧪 测试环境配置

### Jest 配置 (jest.config.js)

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/pages/_app.tsx',
    '!src/pages/_document.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

### Jest 设置文件 (jest.setup.js)

```javascript
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

## 🚀 验证项目设置

### 创建测试页面

创建 `src/pages/index.tsx`：

```typescript
import React from 'react';
import Head from 'next/head';

const HomePage: React.FC = () => {
  return (
    <>
      <Head>
        <title>URL Shortener</title>
        <meta name="description" content="Fast and secure URL shortener" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            URL Shortener
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Fast, secure, and reliable URL shortening service
          </p>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-green-600 font-medium">
              ✅ Project setup complete!
            </p>
            <p className="text-gray-500 mt-2">
              Ready to start building amazing features
            </p>
          </div>
        </div>
      </main>
    </>
  );
};

export default HomePage;
```

### 运行项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 在浏览器中访问 http://localhost:3000
```

### 验证配置

```bash
# 检查 TypeScript 类型
npm run type-check

# 运行 ESLint
npm run lint

# 运行测试
npm run test
```

## 📝 小结

本章我们完成了项目的基础设置：

1. **项目初始化**：使用 Next.js 创建项目骨架
2. **配置文件**：TypeScript、Tailwind、ESLint 等配置
3. **目录结构**：建立清晰的项目组织结构
4. **开发环境**：配置开发工具和测试环境
5. **验证设置**：确保所有配置正确工作

关键要点：
- 使用现代化的工具链提高开发效率
- 配置 TypeScript 提供类型安全
- 设置代码质量工具保证代码规范
- 建立清晰的项目结构便于维护

下一章我们将深入学习 TypeScript 类型系统的设计。
