# 第3章：TypeScript 类型系统设计

## 🎯 本章目标

学习如何设计完整的 TypeScript 类型系统：
- API 接口类型定义
- 组件 Props 类型设计
- 状态管理类型规范
- 工具类型和泛型应用

## 🏗 类型系统架构

### 类型分层设计

```
Type System Architecture
┌─────────────────────────────────────┐
│           API Types                 │ ← 后端接口类型
├─────────────────────────────────────┤
│         Domain Types                │ ← 业务领域类型
├─────────────────────────────────────┤
│       Component Types               │ ← 组件接口类型
├─────────────────────────────────────┤
│        Utility Types                │ ← 工具类型
└─────────────────────────────────────┘
```

### 类型文件组织

```
src/types/
├── api.ts          # API 相关类型
├── components.ts   # 组件相关类型
├── common.ts       # 通用类型
└── utils.ts        # 工具类型
```

## 📡 API 类型定义

### 基础 API 类型

创建 `src/types/api.ts`：

```typescript
// ===== 基础 API 类型 =====

// API 请求基础类型
export interface BaseRequest {
  timestamp?: string;
  requestId?: string;
}

// API 响应基础类型
export interface BaseResponse {
  timestamp: string;
  requestId?: string;
}

// 错误响应类型
export interface ErrorResponse {
  error: string;
  message?: string;
  code?: number;
  details?: Record<string, any>;
}

// 分页参数类型
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

// 分页响应类型
export interface PaginatedResponse<T> extends BaseResponse {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 排序参数类型
export interface SortParams<T = string> {
  sortBy: T;
  sortOrder: 'asc' | 'desc';
}

// 搜索参数类型
export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
}
```

### URL 相关 API 类型

```typescript
// ===== URL 短链接相关类型 =====

// 创建短链接请求
export interface ShortenRequest extends BaseRequest {
  url: string;
  customCode?: string;
  expiresAt?: string;
  description?: string;
}

// 短链接响应
export interface ShortenResponse extends BaseResponse {
  id: number;
  original_url: string;
  short_code: string;
  short_url: string;
  created_at: string;
  expires_at?: string;
}

// URL 详细信息响应
export interface URLInfoResponse extends ShortenResponse {
  access_count: number;
  last_accessed?: string;
  is_active: boolean;
  description?: string;
}

// URL 列表查询参数
export interface URLListParams extends PaginationParams, SearchParams {
  sortBy?: keyof URLInfoResponse;
  sortOrder?: 'asc' | 'desc';
  status?: 'active' | 'inactive' | 'expired';
  dateFrom?: string;
  dateTo?: string;
}

// 批量操作请求
export interface BatchURLRequest extends BaseRequest {
  urls: string[];
  options?: {
    customPrefix?: string;
    expiresAt?: string;
  };
}

// 批量操作响应
export interface BatchURLResponse extends BaseResponse {
  results: Array<{
    original_url: string;
    result: ShortenResponse | ErrorResponse;
    success: boolean;
  }>;
  summary: {
    total: number;
    success: number;
    failed: number;
  };
}
```

### 统计相关类型

```typescript
// ===== 统计分析相关类型 =====

// 基础统计数据
export interface StatsResponse extends BaseResponse {
  total_urls: number;
  total_accesses: number;
  active_urls: number;
  created_today: number;
  accessed_today: number;
  memory_usage?: number;
}

// 时间序列数据点
export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

// 时间序列统计
export interface TimeSeriesStats extends BaseResponse {
  period: 'hour' | 'day' | 'week' | 'month';
  data: TimeSeriesDataPoint[];
  summary: {
    total: number;
    average: number;
    peak: number;
    growth_rate?: number;
  };
}

// 热门 URL 统计
export interface PopularURLStats extends BaseResponse {
  urls: Array<{
    short_code: string;
    original_url: string;
    access_count: number;
    created_at: string;
    last_accessed: string;
  }>;
  period: string;
  limit: number;
}

// 地理位置统计
export interface GeographicStats extends BaseResponse {
  countries: Array<{
    country_code: string;
    country_name: string;
    access_count: number;
    percentage: number;
  }>;
  cities: Array<{
    city: string;
    country: string;
    access_count: number;
    percentage: number;
  }>;
}
```

## 🧩 组件类型设计

### 基础组件类型

创建 `src/types/components.ts`：

```typescript
import React from 'react';

// ===== 基础组件类型 =====

// 基础组件 Props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
  'data-testid'?: string;
}

// 可点击组件 Props
export interface ClickableProps {
  onClick?: (event: React.MouseEvent) => void;
  disabled?: boolean;
  loading?: boolean;
}

// 表单组件基础 Props
export interface FormComponentProps {
  name?: string;
  value?: any;
  onChange?: (value: any) => void;
  onBlur?: (event: React.FocusEvent) => void;
  onFocus?: (event: React.FocusEvent) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

// 尺寸变体类型
export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// 颜色变体类型
export type ColorVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info';

// 按钮变体类型
export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'outline' 
  | 'ghost' 
  | 'danger';
```

### 具体组件类型

```typescript
// ===== 具体组件类型 =====

// Button 组件 Props
export interface ButtonProps extends BaseComponentProps, ClickableProps {
  variant?: ButtonVariant;
  size?: SizeVariant;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

// Input 组件 Props
export interface InputProps extends BaseComponentProps, FormComponentProps {
  type?: 'text' | 'email' | 'password' | 'url' | 'number' | 'tel';
  placeholder?: string;
  label?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  autoComplete?: string;
  autoFocus?: boolean;
  maxLength?: number;
  minLength?: number;
}

// Card 组件 Props
export interface CardProps extends BaseComponentProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

// Modal 组件 Props
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

// Table 组件 Props
export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
}

export interface TableProps<T = any> extends BaseComponentProps {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  rowKey?: keyof T | ((record: T) => string);
  onRowClick?: (record: T, index: number) => void;
}
```

### 功能组件类型

```typescript
// ===== 功能组件类型 =====

// URL Shortener 组件 Props
export interface URLShortenerProps extends BaseComponentProps {
  onURLCreated?: (url: ShortenResponse) => void;
  defaultValue?: string;
  autoFocus?: boolean;
  showHistory?: boolean;
}

// URL List 组件 Props
export interface URLListProps extends BaseComponentProps {
  urls?: URLInfoResponse[];
  loading?: boolean;
  onRefresh?: () => void;
  onURLClick?: (url: URLInfoResponse) => void;
  onURLDelete?: (url: URLInfoResponse) => void;
  searchable?: boolean;
  sortable?: boolean;
  pagination?: boolean;
}

// Stats Dashboard 组件 Props
export interface StatsDashboardProps extends BaseComponentProps {
  timeRange?: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange?: (range: string) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// Chart 组件 Props
export interface ChartProps extends BaseComponentProps {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  data: any;
  options?: any;
  height?: number;
  responsive?: boolean;
  maintainAspectRatio?: boolean;
}
```

## 🔄 状态管理类型

### 应用状态类型

创建 `src/types/state.ts`：

```typescript
// ===== 应用状态类型 =====

// 加载状态
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
  lastUpdated?: string;
}

// 异步操作状态
export interface AsyncState<T> extends LoadingState {
  data: T | null;
}

// 分页状态
export interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

// 搜索状态
export interface SearchState {
  query: string;
  filters: Record<string, any>;
  results: any[];
  total: number;
}

// 排序状态
export interface SortState<T = string> {
  field: T;
  order: 'asc' | 'desc';
}

// URL 管理状态
export interface URLManagementState {
  urls: AsyncState<URLInfoResponse[]>;
  selectedURLs: string[];
  search: SearchState;
  sort: SortState<keyof URLInfoResponse>;
  pagination: PaginationState;
  filters: {
    status?: 'active' | 'inactive' | 'expired';
    dateRange?: {
      start: string;
      end: string;
    };
  };
}

// 统计状态
export interface StatsState {
  overview: AsyncState<StatsResponse>;
  timeSeries: AsyncState<TimeSeriesStats>;
  popular: AsyncState<PopularURLStats>;
  geographic: AsyncState<GeographicStats>;
  timeRange: '7d' | '30d' | '90d' | '1y';
}

// 应用全局状态
export interface AppState {
  user: {
    isAuthenticated: boolean;
    profile?: any;
  };
  ui: {
    theme: 'light' | 'dark' | 'system';
    sidebarOpen: boolean;
    notifications: Notification[];
  };
  urls: URLManagementState;
  stats: StatsState;
}
```

### Context 类型

```typescript
// ===== Context 类型 =====

// App Context 类型
export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

// Action 类型
export type AppAction =
  | { type: 'SET_LOADING'; payload: { key: string; loading: boolean } }
  | { type: 'SET_ERROR'; payload: { key: string; error: string } }
  | { type: 'SET_DATA'; payload: { key: string; data: any } }
  | { type: 'UPDATE_SEARCH'; payload: Partial<SearchState> }
  | { type: 'UPDATE_PAGINATION'; payload: Partial<PaginationState> }
  | { type: 'UPDATE_SORT'; payload: SortState }
  | { type: 'TOGGLE_THEME' }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string };

// Notification 类型
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

## 🛠 工具类型和泛型

### 通用工具类型

创建 `src/types/utils.ts`：

```typescript
// ===== 通用工具类型 =====

// 使某些属性可选
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// 使某些属性必需
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// 深度可选
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 深度必需
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// 提取函数参数类型
export type ExtractFunctionArgs<T> = T extends (...args: infer P) => any ? P : never;

// 提取函数返回类型
export type ExtractFunctionReturn<T> = T extends (...args: any[]) => infer R ? R : never;

// 提取 Promise 类型
export type ExtractPromiseType<T> = T extends Promise<infer U> ? U : T;

// 键值对类型
export type KeyValuePair<K extends string | number | symbol = string, V = any> = {
  [key in K]: V;
};

// 枚举值类型
export type EnumValues<T> = T[keyof T];

// 数组元素类型
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

// 对象值类型
export type ObjectValues<T> = T[keyof T];
```

### API 相关工具类型

```typescript
// ===== API 相关工具类型 =====

// API 响应包装器
export type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: ErrorResponse;
};

// API 方法类型
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API 端点配置
export interface ApiEndpoint {
  method: ApiMethod;
  url: string;
  requiresAuth?: boolean;
  timeout?: number;
}

// API 客户端配置
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
  interceptors?: {
    request?: (config: any) => any;
    response?: (response: any) => any;
    error?: (error: any) => any;
  };
}

// Hook 返回类型
export interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  mutate: (data: T) => void;
}

// 异步操作 Hook 返回类型
export interface UseAsyncOperationReturn<T, P = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (params?: P) => Promise<T>;
  reset: () => void;
}
```

### 表单相关类型

```typescript
// ===== 表单相关类型 =====

// 表单字段类型
export interface FormField<T = any> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

// 表单状态类型
export interface FormState<T extends Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  dirty: boolean;
  valid: boolean;
  submitting: boolean;
}

// 表单验证规则
export interface ValidationRule<T = any> {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | undefined;
  message?: string;
}

// 表单配置
export interface FormConfig<T extends Record<string, any>> {
  initialValues: T;
  validationRules?: Partial<Record<keyof T, ValidationRule>>;
  onSubmit: (values: T) => Promise<void> | void;
  onValidate?: (values: T) => Partial<Record<keyof T, string>>;
}

// 表单 Hook 返回类型
export interface UseFormReturn<T extends Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  dirty: boolean;
  valid: boolean;
  submitting: boolean;
  setValue: (field: keyof T, value: any) => void;
  setError: (field: keyof T, error: string) => void;
  setTouched: (field: keyof T, touched: boolean) => void;
  reset: () => void;
  submit: () => Promise<void>;
  validate: () => boolean;
}
```

## 🔍 类型守卫和验证

### 类型守卫函数

```typescript
// ===== 类型守卫函数 =====

// 检查是否为错误响应
export function isErrorResponse(response: any): response is ErrorResponse {
  return response && typeof response.error === 'string';
}

// 检查是否为成功响应
export function isSuccessResponse<T>(response: any): response is T {
  return response && !isErrorResponse(response);
}

// 检查是否为有效的 URL
export function isValidURL(value: any): value is string {
  if (typeof value !== 'string') return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

// 检查是否为非空数组
export function isNonEmptyArray<T>(value: any): value is T[] {
  return Array.isArray(value) && value.length > 0;
}

// 检查是否为有效的短码
export function isValidShortCode(value: any): value is string {
  return typeof value === 'string' && /^[a-zA-Z0-9]+$/.test(value);
}
```

### 运行时类型验证

```typescript
// ===== 运行时类型验证 =====

// 验证 API 响应结构
export function validateApiResponse<T>(
  data: any,
  validator: (data: any) => data is T
): T {
  if (!validator(data)) {
    throw new Error('Invalid API response structure');
  }
  return data;
}

// 验证 URL 信息响应
export function validateURLInfoResponse(data: any): data is URLInfoResponse {
  return (
    data &&
    typeof data.id === 'number' &&
    typeof data.original_url === 'string' &&
    typeof data.short_code === 'string' &&
    typeof data.short_url === 'string' &&
    typeof data.created_at === 'string' &&
    typeof data.access_count === 'number'
  );
}

// 验证统计响应
export function validateStatsResponse(data: any): data is StatsResponse {
  return (
    data &&
    typeof data.total_urls === 'number' &&
    typeof data.total_accesses === 'number'
  );
}
```

## 📝 小结

本章我们设计了完整的 TypeScript 类型系统：

1. **API 类型**：完整的后端接口类型定义
2. **组件类型**：可复用的组件接口设计
3. **状态类型**：应用状态管理类型规范
4. **工具类型**：通用的类型工具和泛型
5. **类型守卫**：运行时类型安全保障

关键要点：
- 分层设计确保类型系统的可维护性
- 泛型和工具类型提高代码复用性
- 类型守卫保证运行时类型安全
- 完整的类型定义提升开发体验

下一章我们将实现 API 客户端和数据管理层。
