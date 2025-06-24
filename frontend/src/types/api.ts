// API 请求和响应类型定义

export interface ShortenRequest {
  url: string;
}

export interface ShortenResponse {
  id: number;
  original_url: string;
  short_code: string;
  short_url: string;
  created_at: string;
}

export interface URLInfoResponse {
  id: number;
  original_url: string;
  short_code: string;
  short_url: string;
  created_at: string;
  access_count: number;
}

export interface ErrorResponse {
  error: string;
  message?: string;
}

export interface HealthResponse {
  status: string;
  service: string;
}

export interface StatsResponse {
  total_urls: number;
  total_accesses: number;
  next_id: number;
  memory_usage?: number;
}

// 前端特定类型
export interface URLItem extends URLInfoResponse {
  // 添加前端特定字段
  isLoading?: boolean;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SearchParams {
  query?: string;
  sortBy?: 'created_at' | 'access_count' | 'original_url';
  sortOrder?: 'asc' | 'desc';
}

// API 错误类型
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// 通用 API 响应包装器
export interface ApiResponse<T> {
  data?: T;
  error?: ErrorResponse;
  status: number;
}

// 加载状态类型
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

// 表单验证类型
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> extends LoadingState {
  data: T;
  errors: ValidationError[];
  isDirty: boolean;
  isValid: boolean;
}
