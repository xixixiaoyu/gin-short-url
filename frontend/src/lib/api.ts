import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  ShortenRequest,
  ShortenResponse,
  URLInfoResponse,
  HealthResponse,
  StatsResponse,
  ErrorResponse,
  APIError,
  ApiResponse,
} from '@/types/api';

// API 客户端配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        // 添加请求时间戳用于调试
        config.metadata = { startTime: new Date() };
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        // 计算请求耗时
        const endTime = new Date();
        const duration = endTime.getTime() - response.config.metadata?.startTime?.getTime();
        console.log(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
        
        return response;
      },
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): APIError {
    if (error.response) {
      // 服务器返回错误响应
      const errorData = error.response.data as ErrorResponse;
      return new APIError(
        errorData.message || errorData.error || 'An error occurred',
        error.response.status,
        errorData.error
      );
    } else if (error.request) {
      // 网络错误
      return new APIError('Network error - please check your connection', 0, 'NETWORK_ERROR');
    } else {
      // 其他错误
      return new APIError(error.message || 'An unexpected error occurred', 0, 'UNKNOWN_ERROR');
    }
  }

  // 创建短链接
  async shortenURL(request: ShortenRequest): Promise<ShortenResponse> {
    try {
      const response = await this.client.post<ShortenResponse>('/shorten', request);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // 获取短链接信息
  async getURLInfo(shortCode: string): Promise<URLInfoResponse> {
    try {
      const response = await this.client.get<URLInfoResponse>(`/info/${shortCode}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // 健康检查
  async healthCheck(): Promise<HealthResponse> {
    try {
      const response = await this.client.get<HealthResponse>('/health');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // 获取统计信息（模拟接口，实际需要后端支持）
  async getStats(): Promise<StatsResponse> {
    try {
      // 由于后端没有统计接口，我们模拟一个
      // 在实际项目中，这应该是一个真实的 API 端点
      const response = await this.client.get<HealthResponse>('/health');
      
      // 模拟统计数据
      return {
        total_urls: 1250,
        total_accesses: 8430,
        next_id: 1251,
        memory_usage: 2048576,
      };
    } catch (error) {
      throw error;
    }
  }

  // 批量获取 URL 信息（模拟接口）
  async getURLList(shortCodes: string[]): Promise<URLInfoResponse[]> {
    try {
      const promises = shortCodes.map(code => this.getURLInfo(code));
      const results = await Promise.allSettled(promises);
      
      return results
        .filter((result): result is PromiseFulfilledResult<URLInfoResponse> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value);
    } catch (error) {
      throw error;
    }
  }

  // 验证 URL 格式
  validateURL(url: string): { isValid: boolean; error?: string } {
    if (!url || url.trim().length === 0) {
      return { isValid: false, error: 'URL is required' };
    }

    try {
      const urlObj = new URL(url.startsWith('http') ? url : `http://${url}`);
      
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { isValid: false, error: 'Only HTTP and HTTPS URLs are supported' };
      }

      if (url.length > 2048) {
        return { isValid: false, error: 'URL is too long (max 2048 characters)' };
      }

      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Invalid URL format' };
    }
  }
}

// 导出单例实例
export const apiClient = new APIClient();

// 导出便捷方法
export const {
  shortenURL,
  getURLInfo,
  healthCheck,
  getStats,
  getURLList,
  validateURL,
} = apiClient;
