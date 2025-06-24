# 第15章：测试策略与实现

## 🎯 本章目标

学习前端应用的完整测试策略：
- 测试金字塔和测试分类
- 单元测试编写
- 集成测试实现
- 端到端测试设计
- 测试工具和最佳实践

## 🏗 测试架构设计

### 测试金字塔

```
    /\
   /  \
  /    \  E2E Tests (少量)
 /______\
/        \
\        / Integration Tests (适量)
 \______/
/        \
\        / Unit Tests (大量)
 \______/
```

### 测试分类

| 测试类型 | 范围 | 速度 | 数量 | 目的 |
|----------|------|------|------|------|
| **单元测试** | 单个函数/组件 | 快 | 多 | 验证逻辑正确性 |
| **集成测试** | 多个组件协作 | 中等 | 适量 | 验证组件交互 |
| **端到端测试** | 完整用户流程 | 慢 | 少 | 验证用户场景 |

## 🧪 测试环境配置

### Jest 配置

```javascript
// jest.config.js
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
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
};

module.exports = createJestConfig(customJestConfig);
```

### 测试设置文件

```javascript
// jest.setup.js
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

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
    readText: jest.fn().mockResolvedValue(''),
  },
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};
```

## 🔧 单元测试实现

### 工具函数测试

```typescript
// src/utils/__tests__/index.test.ts
import { 
  dateUtils, 
  numberUtils, 
  urlUtils, 
  clipboardUtils,
  debounce,
  throttle,
  generateId,
  storageUtils 
} from '../index';

describe('Utils', () => {
  describe('dateUtils', () => {
    beforeAll(() => {
      // Mock Date for consistent testing
      jest.useFakeTimers().setSystemTime(new Date('2023-01-01T12:00:00Z'));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('formats relative time correctly', () => {
      const pastDate = new Date('2023-01-01T10:00:00Z');
      const result = dateUtils.formatRelative(pastDate);
      expect(result).toContain('ago');
    });

    it('formats absolute time correctly', () => {
      const date = new Date('2023-01-01T12:00:00Z');
      const result = dateUtils.formatAbsolute(date, 'yyyy-MM-dd');
      expect(result).toBe('2023-01-01');
    });
  });

  describe('numberUtils', () => {
    it('formats large numbers correctly', () => {
      expect(numberUtils.formatLarge(500)).toBe('500');
      expect(numberUtils.formatLarge(1500)).toBe('1.5K');
      expect(numberUtils.formatLarge(1500000)).toBe('1.5M');
    });

    it('formats percentage correctly', () => {
      expect(numberUtils.formatPercentage(25, 100)).toBe('25.0%');
      expect(numberUtils.formatPercentage(0, 0)).toBe('0%');
    });

    it('formats bytes correctly', () => {
      expect(numberUtils.formatBytes(0)).toBe('0 B');
      expect(numberUtils.formatBytes(1024)).toBe('1 KB');
      expect(numberUtils.formatBytes(1048576)).toBe('1 MB');
    });
  });

  describe('urlUtils', () => {
    it('extracts domain correctly', () => {
      expect(urlUtils.extractDomain('https://www.example.com/path')).toBe('www.example.com');
      expect(urlUtils.extractDomain('example.com')).toBe('example.com');
    });

    it('truncates URL correctly', () => {
      const longUrl = 'https://www.example.com/very/long/path/that/should/be/truncated';
      const result = urlUtils.truncateURL(longUrl, 30);
      expect(result).toHaveLength(30);
      expect(result).toEndWith('...');
    });

    it('validates URL correctly', () => {
      expect(urlUtils.isValidURL('https://www.example.com')).toBe(true);
      expect(urlUtils.isValidURL('www.example.com')).toBe(true);
      expect(urlUtils.isValidURL('invalid-url')).toBe(false);
    });
  });

  describe('clipboardUtils', () => {
    beforeEach(() => {
      (navigator.clipboard.writeText as jest.Mock).mockClear();
    });

    it('copies text successfully', async () => {
      (navigator.clipboard.writeText as jest.Mock).mockResolvedValue(undefined);
      
      const result = await clipboardUtils.copy('test text');
      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
    });

    it('handles copy failure', async () => {
      (navigator.clipboard.writeText as jest.Mock).mockRejectedValue(new Error('Failed'));
      
      const result = await clipboardUtils.copy('test text');
      expect(result).toBe(false);
    });
  });

  describe('debounce', () => {
    it('debounces function calls', () => {
      jest.useFakeTimers();
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });
  });

  describe('storageUtils', () => {
    beforeEach(() => {
      localStorage.clear();
      (localStorage.getItem as jest.Mock).mockClear();
      (localStorage.setItem as jest.Mock).mockClear();
    });

    it('gets item from localStorage', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('{"test": "value"}');
      
      const result = storageUtils.get('test-key');
      expect(result).toEqual({ test: 'value' });
      expect(localStorage.getItem).toHaveBeenCalledWith('test-key');
    });

    it('sets item to localStorage', () => {
      const testData = { test: 'value' };
      storageUtils.set('test-key', testData);
      
      expect(localStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(testData));
    });

    it('handles JSON parse errors gracefully', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('invalid-json');
      
      const result = storageUtils.get('test-key', 'default');
      expect(result).toBe('default');
    });
  });
});
```

### 组件单元测试

```typescript
// src/components/ui/__tests__/Button.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary-600');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-gray-100');

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('border-gray-300');

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-600');
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('renders with icon', () => {
    const TestIcon = () => <span data-testid="test-icon">Icon</span>;
    render(<Button icon={<TestIcon />}>With Icon</Button>);
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('With Icon')).toBeInTheDocument();
  });
});
```

### 自定义 Hook 测试

```typescript
// src/hooks/__tests__/useAPI.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAPI, useAsyncOperation, useCopyToClipboard } from '../useAPI';

// Mock API function
const mockApiCall = jest.fn();

describe('useAPI Hook', () => {
  beforeEach(() => {
    mockApiCall.mockClear();
  });

  it('should handle successful API call', async () => {
    const mockData = { id: 1, name: 'Test' };
    mockApiCall.mockResolvedValue(mockData);

    const { result } = renderHook(() => useAPI(mockApiCall));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
  });

  it('should handle API error', async () => {
    const mockError = new Error('API Error');
    mockApiCall.mockRejectedValue(mockError);

    const { result } = renderHook(() => useAPI(mockApiCall));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe('API Error');
  });

  it('should refetch data', async () => {
    const mockData = { id: 1, name: 'Test' };
    mockApiCall.mockResolvedValue(mockData);

    const { result } = renderHook(() => useAPI(mockApiCall));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockApiCall).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockApiCall).toHaveBeenCalledTimes(2);
  });
});

describe('useAsyncOperation Hook', () => {
  it('should execute async operation', async () => {
    const mockOperation = jest.fn().mockResolvedValue('success');
    const { result } = renderHook(() => useAsyncOperation());

    expect(result.current.loading).toBe(false);

    await act(async () => {
      await result.current.execute(mockOperation);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe('success');
    expect(mockOperation).toHaveBeenCalledTimes(1);
  });

  it('should handle operation error', async () => {
    const mockOperation = jest.fn().mockRejectedValue(new Error('Operation failed'));
    const { result } = renderHook(() => useAsyncOperation());

    await act(async () => {
      try {
        await result.current.execute(mockOperation);
      } catch (error) {
        // Expected error
      }
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Operation failed');
  });
});

describe('useCopyToClipboard Hook', () => {
  beforeEach(() => {
    (navigator.clipboard.writeText as jest.Mock).mockClear();
  });

  it('should copy text to clipboard', async () => {
    (navigator.clipboard.writeText as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useCopyToClipboard());

    expect(result.current.isCopied).toBe(false);

    await act(async () => {
      await result.current.copy('test text');
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
    expect(result.current.isCopied).toBe(true);

    // Should reset after timeout
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 2100));
    });

    expect(result.current.isCopied).toBe(false);
  });
});
```

## 🔗 集成测试实现

### Mock 服务器设置

```typescript
// src/__mocks__/server.ts
import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const server = setupServer(
  // Mock shorten URL endpoint
  rest.post('/shorten', (req, res, ctx) => {
    return res(
      ctx.json({
        id: 1,
        original_url: 'https://example.com',
        short_code: 'abc123',
        short_url: 'http://localhost:8080/abc123',
        created_at: '2023-01-01T12:00:00Z',
      })
    );
  }),

  // Mock get URL info endpoint
  rest.get('/info/:shortCode', (req, res, ctx) => {
    const { shortCode } = req.params;

    if (shortCode === 'notfound') {
      return res(
        ctx.status(404),
        ctx.json({ error: 'not_found', message: 'URL not found' })
      );
    }

    return res(
      ctx.json({
        id: 1,
        original_url: 'https://example.com',
        short_code: shortCode,
        short_url: `http://localhost:8080/${shortCode}`,
        created_at: '2023-01-01T12:00:00Z',
        access_count: 5,
      })
    );
  }),

  // Mock health check endpoint
  rest.get('/health', (req, res, ctx) => {
    return res(
      ctx.json({
        status: 'ok',
        service: 'url-shortener',
      })
    );
  }),

  // Mock stats endpoint
  rest.get('/stats', (req, res, ctx) => {
    return res(
      ctx.json({
        total_urls: 1250,
        total_accesses: 8430,
        next_id: 1251,
        memory_usage: 2048576,
      })
    );
  })
);
```

## 📝 小结

本章我们建立了完整的测试体系：

1. **测试环境配置**：Jest + React Testing Library
2. **单元测试**：工具函数、组件、Hooks
3. **集成测试**：API 客户端、组件交互
4. **Mock 策略**：API 服务、浏览器 API
5. **测试最佳实践**：覆盖率、可维护性

关键要点：
- 遵循测试金字塔原则
- 重点测试业务逻辑和用户交互
- 使用 Mock 隔离外部依赖
- 保持测试简单和可维护
- 追求合理的测试覆盖率

下一章我们将学习部署与生产环境配置。
