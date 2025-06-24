# 第17章：最佳实践与代码规范

## 🎯 本章目标

总结前端开发的最佳实践：
- 代码组织和架构原则
- 性能优化策略
- 安全性考虑
- 可维护性和可扩展性
- 团队协作规范

## 🏗 架构设计原则

### SOLID 原则在前端的应用

#### 1. 单一职责原则 (SRP)
```typescript
// ❌ 违反 SRP - 组件职责过多
const UserDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 数据获取逻辑
  const fetchUsers = async () => { /* ... */ };
  
  // 数据处理逻辑
  const processUserData = (data) => { /* ... */ };
  
  // 渲染逻辑
  return (
    <div>
      {/* 复杂的 UI 逻辑 */}
    </div>
  );
};

// ✅ 遵循 SRP - 职责分离
const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchUsers = async () => { /* ... */ };
  
  return { users, loading, fetchUsers };
};

const UserList = ({ users, loading }) => {
  if (loading) return <LoadingSpinner />;
  return <div>{/* 渲染用户列表 */}</div>;
};

const UserDashboard = () => {
  const { users, loading, fetchUsers } = useUsers();
  
  return <UserList users={users} loading={loading} />;
};
```

#### 2. 开闭原则 (OCP)
```typescript
// ✅ 对扩展开放，对修改关闭
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', children }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium';
  const variantClasses = getVariantClasses(variant);
  const sizeClasses = getSizeClasses(size);
  
  return (
    <button className={cn(baseClasses, variantClasses, sizeClasses)}>
      {children}
    </button>
  );
};

// 扩展新变体无需修改原组件
const getVariantClasses = (variant: string) => {
  const variants = {
    primary: 'bg-blue-600 text-white',
    secondary: 'bg-gray-200 text-gray-900',
    outline: 'border border-gray-300 bg-white',
    // 新增变体
    danger: 'bg-red-600 text-white',
  };
  return variants[variant] || variants.primary;
};
```

#### 3. 依赖倒置原则 (DIP)
```typescript
// ✅ 依赖抽象而非具体实现
interface ApiClient {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data: any): Promise<T>;
}

interface URLService {
  shortenURL(url: string): Promise<ShortenResponse>;
  getURLInfo(shortCode: string): Promise<URLInfoResponse>;
}

class URLServiceImpl implements URLService {
  constructor(private apiClient: ApiClient) {}
  
  async shortenURL(url: string): Promise<ShortenResponse> {
    return this.apiClient.post('/shorten', { url });
  }
  
  async getURLInfo(shortCode: string): Promise<URLInfoResponse> {
    return this.apiClient.get(`/info/${shortCode}`);
  }
}

// 组件依赖抽象接口
const URLShortener = ({ urlService }: { urlService: URLService }) => {
  const handleSubmit = async (url: string) => {
    const result = await urlService.shortenURL(url);
    // ...
  };
  
  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
};
```

### 组件设计模式

#### 1. 容器/展示组件模式
```typescript
// 容器组件 - 负责数据和逻辑
const URLListContainer: React.FC = () => {
  const { urls, loading, error, refetch } = useURLList();
  
  if (error) {
    return <ErrorBoundary error={error} onRetry={refetch} />;
  }
  
  return <URLListPresentation urls={urls} loading={loading} />;
};

// 展示组件 - 负责 UI 渲染
interface URLListPresentationProps {
  urls: URLInfoResponse[];
  loading: boolean;
}

const URLListPresentation: React.FC<URLListPresentationProps> = ({ urls, loading }) => {
  if (loading) return <LoadingSpinner />;
  
  return (
    <div className="space-y-4">
      {urls.map(url => (
        <URLCard key={url.id} url={url} />
      ))}
    </div>
  );
};
```

#### 2. 高阶组件 (HOC) 模式
```typescript
// 通用的加载状态 HOC
function withLoading<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithLoadingComponent(props: P & { loading?: boolean }) {
    const { loading, ...restProps } = props;
    
    if (loading) {
      return <LoadingSpinner />;
    }
    
    return <Component {...(restProps as P)} />;
  };
}

// 使用 HOC
const URLListWithLoading = withLoading(URLList);

// 在组件中使用
<URLListWithLoading urls={urls} loading={loading} />
```

#### 3. Render Props 模式
```typescript
interface DataFetcherProps<T> {
  url: string;
  children: (data: {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
  }) => React.ReactNode;
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const { data, loading, error, refetch } = useAPI<T>(() => apiClient.get(url));
  
  return <>{children({ data, loading, error, refetch })}</>;
}

// 使用 Render Props
<DataFetcher<URLInfoResponse[]> url="/urls">
  {({ data: urls, loading, error, refetch }) => (
    <div>
      {error && <ErrorMessage error={error} onRetry={refetch} />}
      {loading && <LoadingSpinner />}
      {urls && <URLList urls={urls} />}
    </div>
  )}
</DataFetcher>
```

## 🚀 性能优化最佳实践

### 1. 组件优化

#### React.memo 使用
```typescript
// ✅ 使用 React.memo 避免不必要的重渲染
const URLCard = React.memo<URLCardProps>(({ url, onDelete }) => {
  return (
    <Card>
      <CardContent>
        <h3>{url.original_url}</h3>
        <p>{url.short_code}</p>
        <Button onClick={() => onDelete(url.id)}>Delete</Button>
      </CardContent>
    </Card>
  );
});

// 自定义比较函数
const URLCard = React.memo<URLCardProps>(
  ({ url, onDelete }) => {
    // 组件实现
  },
  (prevProps, nextProps) => {
    return (
      prevProps.url.id === nextProps.url.id &&
      prevProps.url.access_count === nextProps.url.access_count
    );
  }
);
```

#### useMemo 和 useCallback 优化
```typescript
const URLList: React.FC<URLListProps> = ({ urls, searchQuery, sortBy }) => {
  // ✅ 缓存计算结果
  const filteredUrls = useMemo(() => {
    return urls.filter(url => 
      url.original_url.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [urls, searchQuery]);

  const sortedUrls = useMemo(() => {
    return [...filteredUrls].sort((a, b) => {
      if (sortBy === 'created_at') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return b.access_count - a.access_count;
    });
  }, [filteredUrls, sortBy]);

  // ✅ 缓存回调函数
  const handleDelete = useCallback((id: number) => {
    onDelete(id);
  }, [onDelete]);

  return (
    <div>
      {sortedUrls.map(url => (
        <URLCard key={url.id} url={url} onDelete={handleDelete} />
      ))}
    </div>
  );
};
```

### 2. 代码分割和懒加载

#### 路由级别的代码分割
```typescript
import { lazy, Suspense } from 'react';

// ✅ 懒加载页面组件
const HomePage = lazy(() => import('@/pages/HomePage'));
const ManagePage = lazy(() => import('@/pages/ManagePage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<PageLoadingSpinner />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/manage" element={<ManagePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
};
```

#### 组件级别的懒加载
```typescript
// ✅ 条件性懒加载重型组件
const StatsChart = lazy(() => import('@/components/StatsChart'));

const StatsPage: React.FC = () => {
  const [showChart, setShowChart] = useState(false);

  return (
    <div>
      <h1>Statistics</h1>
      <Button onClick={() => setShowChart(true)}>
        Show Chart
      </Button>
      
      {showChart && (
        <Suspense fallback={<ChartLoadingSkeleton />}>
          <StatsChart />
        </Suspense>
      )}
    </div>
  );
};
```

### 3. 图片和资源优化

#### Next.js Image 组件
```typescript
import Image from 'next/image';

// ✅ 使用 Next.js Image 组件优化
const UserAvatar: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={40}
      height={40}
      className="rounded-full"
      priority={false} // 非关键图片
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
    />
  );
};
```

#### 资源预加载
```typescript
// ✅ 预加载关键资源
const HomePage: React.FC = () => {
  useEffect(() => {
    // 预加载下一页可能需要的资源
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = '/manage';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return <div>{/* 页面内容 */}</div>;
};
```

## 🔒 安全性最佳实践

### 1. XSS 防护

#### 输入验证和清理
```typescript
import DOMPurify from 'dompurify';

// ✅ 清理用户输入
const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

const URLInput: React.FC = () => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证和清理输入
    const cleanUrl = sanitizeInput(url);
    const validation = validateURL(cleanUrl);
    
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }
    
    // 提交清理后的数据
    onSubmit(cleanUrl);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        maxLength={2048} // 限制输入长度
      />
    </form>
  );
};
```

#### 安全的 HTML 渲染
```typescript
// ❌ 危险的 HTML 渲染
const DangerousComponent = ({ content }: { content: string }) => {
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
};

// ✅ 安全的 HTML 渲染
const SafeComponent = ({ content }: { content: string }) => {
  const sanitizedContent = useMemo(() => {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
      ALLOWED_ATTR: []
    });
  }, [content]);

  return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
};
```

### 2. CSRF 防护

#### API 请求安全
```typescript
// ✅ 使用 CSRF Token
class SecureApiClient {
  private csrfToken: string | null = null;

  async getCSRFToken(): Promise<string> {
    if (!this.csrfToken) {
      const response = await fetch('/api/csrf-token');
      const data = await response.json();
      this.csrfToken = data.token;
    }
    return this.csrfToken;
  }

  async post<T>(url: string, data: any): Promise<T> {
    const token = await this.getCSRFToken();
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}
```

### 3. 敏感信息保护

#### 环境变量管理
```typescript
// ✅ 安全的环境变量使用
const config = {
  // 公开配置 - 可以暴露给客户端
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  
  // 私有配置 - 仅在服务端使用
  secretKey: process.env.SECRET_KEY, // 不要使用 NEXT_PUBLIC_ 前缀
  
  // 开发环境配置
  isDevelopment: process.env.NODE_ENV === 'development',
};

// ❌ 不要在客户端代码中硬编码敏感信息
const BAD_CONFIG = {
  apiKey: 'sk-1234567890abcdef', // 危险！
  secretToken: 'super-secret-token', // 危险！
};

// ✅ 使用环境变量
const GOOD_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  // 注意：即使使用环境变量，也不要暴露真正的密钥给客户端
};
```

## 📝 代码质量和规范

### 1. TypeScript 最佳实践

#### 严格的类型定义
```typescript
// ✅ 严格的类型定义
interface URLFormData {
  readonly url: string;
  readonly customCode?: string;
  readonly expiresAt?: Date;
}

interface URLFormErrors {
  readonly [K in keyof URLFormData]?: string;
}

// 使用泛型提高复用性
interface ApiResponse<T> {
  readonly data: T;
  readonly success: boolean;
  readonly message?: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
  };
}

// 使用联合类型确保类型安全
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

interface AsyncState<T> {
  readonly status: LoadingState;
  readonly data: T | null;
  readonly error: string | null;
}
```

#### 类型守卫和断言
```typescript
// ✅ 类型守卫
function isURLInfoResponse(data: any): data is URLInfoResponse {
  return (
    data &&
    typeof data.id === 'number' &&
    typeof data.original_url === 'string' &&
    typeof data.short_code === 'string' &&
    typeof data.access_count === 'number'
  );
}

// 使用类型守卫
const processURLData = (data: unknown) => {
  if (isURLInfoResponse(data)) {
    // TypeScript 现在知道 data 是 URLInfoResponse 类型
    console.log(data.access_count); // 类型安全
  }
};

// ✅ 自定义类型断言
function assertIsURLInfoResponse(data: any): asserts data is URLInfoResponse {
  if (!isURLInfoResponse(data)) {
    throw new Error('Invalid URL info response');
  }
}
```

### 2. 错误处理模式

#### 统一的错误边界
```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 记录错误到监控服务
    console.error('Error caught by boundary:', error, errorInfo);
    
    // 可以发送到错误监控服务
    // errorReportingService.captureException(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <details>
            {this.state.error?.message}
          </details>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### 异步错误处理
```typescript
// ✅ 统一的异步错误处理
const useAsyncError = () => {
  const [error, setError] = useState<Error | null>(null);

  const captureError = useCallback((error: Error) => {
    setError(error);
    
    // 记录错误
    console.error('Async error:', error);
    
    // 发送到监控服务
    // errorReportingService.captureException(error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, captureError, clearError };
};

// 在组件中使用
const URLShortener: React.FC = () => {
  const { error, captureError, clearError } = useAsyncError();

  const handleSubmit = async (url: string) => {
    try {
      clearError();
      const result = await shortenURL({ url });
      // 处理成功结果
    } catch (err) {
      captureError(err as Error);
    }
  };

  if (error) {
    return <ErrorMessage error={error} onRetry={clearError} />;
  }

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
};
```

## 📝 小结

本章总结了前端开发的最佳实践：

1. **架构原则**：SOLID 原则、组件设计模式
2. **性能优化**：组件优化、代码分割、资源优化
3. **安全性**：XSS/CSRF 防护、敏感信息保护
4. **代码质量**：TypeScript 最佳实践、错误处理

关键要点：
- 遵循设计原则确保代码可维护性
- 性能优化要基于实际测量结果
- 安全性要从设计阶段就考虑
- 错误处理要统一和用户友好
- 代码规范要团队一致执行

通过遵循这些最佳实践，可以构建出高质量、可维护、安全的前端应用。
