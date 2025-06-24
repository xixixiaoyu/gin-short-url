# 第8章：主要功能组件开发

## 🎯 本章目标

学习如何开发核心功能组件：
- URL 短链接生成器组件
- URL 列表管理组件
- 统计分析仪表板组件
- 组件间通信和状态管理

## 🔗 URL 短链接生成器组件

### 组件设计思路

URL 短链接生成器是应用的核心组件，需要具备：
- 用户友好的输入界面
- 实时 URL 验证
- 加载状态显示
- 结果展示和复制功能
- 错误处理和用户反馈

### 组件实现

创建 `src/components/URLShortener.tsx`：

```typescript
import React, { useState } from 'react';
import { Link2, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useAsyncOperation, useCopyToClipboard } from '@/hooks/useAPI';
import { shortenURL, validateURL } from '@/lib/api';
import { ShortenResponse } from '@/types/api';
import { cn } from '@/utils';
import toast from 'react-hot-toast';

interface URLShortenerProps {
  onURLCreated?: (url: ShortenResponse) => void;
  className?: string;
  defaultValue?: string;
  autoFocus?: boolean;
}

const URLShortener: React.FC<URLShortenerProps> = ({
  onURLCreated,
  className,
  defaultValue = '',
  autoFocus = false
}) => {
  // 状态管理
  const [inputURL, setInputURL] = useState(defaultValue);
  const [validationError, setValidationError] = useState('');
  const [result, setResult] = useState<ShortenResponse | null>(null);

  // 自定义 Hooks
  const { execute: createShortURL, loading } = useAsyncOperation<ShortenResponse>();
  const { copy, isCopied } = useCopyToClipboard();

  // 输入处理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputURL(value);

    // 清除之前的错误和结果
    if (validationError) setValidationError('');
    if (result) setResult(null);
  };

  // 表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedURL = inputURL.trim();
    if (!trimmedURL) {
      setValidationError('Please enter a URL');
      return;
    }

    // URL 验证
    const validation = validateURL(trimmedURL);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid URL format');
      return;
    }

    try {
      const response = await createShortURL(shortenURL, { url: trimmedURL });
      setResult(response);
      setInputURL('');
      setValidationError('');

      // 通知父组件
      onURLCreated?.(response);

      toast.success('Short URL created successfully!');
    } catch (error) {
      toast.error('Failed to create short URL. Please try again.');
    }
  };

  // 复制功能
  const handleCopy = async (text: string) => {
    const success = await copy(text);
    if (success) {
      toast.success('Copied to clipboard!');
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  // 访问链接
  const handleVisitOriginal = () => {
    if (result?.original_url) {
      window.open(result.original_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleVisitShort = () => {
    if (result?.short_url) {
      window.open(result.short_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      {/* 输入表单 */}
      <Card className="mb-6">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Shorten Your URL
              </h2>
              <p className="text-gray-600 mb-4">
                Enter a long URL to get a shortened version that's easy to share.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  type="url"
                  placeholder="Enter your URL here (e.g., https://example.com)"
                  value={inputURL}
                  onChange={handleInputChange}
                  error={validationError}
                  leftIcon={<Link2 className="h-4 w-4" />}
                  disabled={loading}
                  autoFocus={autoFocus}
                />
              </div>
              <Button
                type="submit"
                loading={loading}
                disabled={!inputURL.trim() || !!validationError}
                className="sm:w-auto w-full"
              >
                Shorten URL
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 结果显示 */}
      {result && (
        <Card className="animate-slide-up">
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Your Short URL is Ready!
                </h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleVisitOriginal}
                    icon={<ExternalLink className="h-4 w-4" />}
                  >
                    Visit Original
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleVisitShort}
                    icon={<ExternalLink className="h-4 w-4" />}
                  >
                    Test Short URL
                  </Button>
                </div>
              </div>

              {/* 原始 URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Original URL:
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 p-3 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-600 break-all">
                      {result.original_url}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(result.original_url)}
                    icon={isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  >
                    {isCopied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>

              {/* 短链接 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Short URL:
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 p-3 bg-primary-50 rounded-lg border border-primary-200">
                    <p className="text-sm font-mono text-primary-700 break-all">
                      {result.short_url}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleCopy(result.short_url)}
                    icon={isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  >
                    {isCopied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>

              {/* 元信息 */}
              <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-200">
                <span>Short Code: {result.short_code}</span>
                <span>Created: {new Date(result.created_at).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default URLShortener;
```

### 组件特性分析

#### 1. 状态管理
```typescript
// 本地状态
const [inputURL, setInputURL] = useState(defaultValue);
const [validationError, setValidationError] = useState('');
const [result, setResult] = useState<ShortenResponse | null>(null);

// 异步操作状态
const { execute: createShortURL, loading } = useAsyncOperation<ShortenResponse>();
```

#### 2. 实时验证
```typescript
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setInputURL(value);

  // 清除之前的错误和结果
  if (validationError) setValidationError('');
  if (result) setResult(null);
};
```

#### 3. 错误处理
```typescript
try {
  const response = await createShortURL(shortenURL, { url: trimmedURL });
  // 成功处理
} catch (error) {
  toast.error('Failed to create short URL. Please try again.');
}
```

## 📋 URL 列表管理组件

### 组件设计思路

URL 列表管理组件负责展示和管理用户创建的短链接：
- 表格形式展示 URL 列表
- 搜索和筛选功能
- 排序功能
- 批量操作支持
- 分页处理

### 组件实现

创建 `src/components/URLList.tsx`：

```typescript
import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Copy,
  ExternalLink,
  Eye,
  Calendar,
  TrendingUp,
  SortAsc,
  SortDesc,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TableRowSkeleton } from '@/components/ui/LoadingSpinner';
import { useCopyToClipboard, useDebounce, useLocalStorage } from '@/hooks/useAPI';
import { getURLInfo } from '@/lib/api';
import { URLInfoResponse } from '@/types/api';
import { dateUtils, numberUtils, urlUtils, cn } from '@/utils';
import toast from 'react-hot-toast';

interface URLListProps {
  refreshTrigger?: number;
  className?: string;
  onURLSelect?: (url: URLInfoResponse) => void;
  selectable?: boolean;
}

interface SortConfig {
  key: keyof URLInfoResponse;
  direction: 'asc' | 'desc';
}

const URLList: React.FC<URLListProps> = ({
  refreshTrigger,
  className,
  onURLSelect,
  selectable = false
}) => {
  // 状态管理
  const [urls, setUrls] = useState<URLInfoResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedURLs, setSelectedURLs] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'created_at',
    direction: 'desc'
  });

  // 本地存储的短码列表
  const [storedShortCodes, setStoredShortCodes] = useLocalStorage<string[]>('shortCodes', []);

  // 自定义 Hooks
  const { copy } = useCopyToClipboard();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // 加载 URL 列表
  const loadURLs = async () => {
    if (storedShortCodes.length === 0) {
      setUrls([]);
      return;
    }

    setLoading(true);
    try {
      const urlPromises = storedShortCodes.map(async (shortCode) => {
        try {
          return await getURLInfo(shortCode);
        } catch (error) {
          console.error(`Failed to load URL info for ${shortCode}:`, error);
          return null;
        }
      });

      const results = await Promise.all(urlPromises);
      const validUrls = results.filter((url): url is URLInfoResponse => url !== null);
      setUrls(validUrls);
    } catch (error) {
      toast.error('Failed to load URL list');
    } finally {
      setLoading(false);
    }
  };

  // 过滤和排序 URLs
  const filteredAndSortedUrls = useMemo(() => {
    let filtered = urls;

    // 搜索过滤
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = urls.filter(url =>
        url.original_url.toLowerCase().includes(query) ||
        url.short_code.toLowerCase().includes(query) ||
        urlUtils.extractDomain(url.original_url).toLowerCase().includes(query)
      );
    }

    // 排序
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const comparison = aValue - bValue;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      return 0;
    });

    return filtered;
  }, [urls, debouncedSearchQuery, sortConfig]);

  // 处理排序
  const handleSort = (key: keyof URLInfoResponse) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // 复制到剪贴板
  const handleCopy = async (text: string, type: string) => {
    const success = await copy(text);
    if (success) {
      toast.success(`${type} copied to clipboard!`);
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  // 访问链接
  const handleVisit = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 选择 URL
  const handleURLSelect = (url: URLInfoResponse) => {
    if (selectable) {
      const isSelected = selectedURLs.includes(url.short_code);
      if (isSelected) {
        setSelectedURLs(prev => prev.filter(code => code !== url.short_code));
      } else {
        setSelectedURLs(prev => [...prev, url.short_code]);
      }
    }
    onURLSelect?.(url);
  };

  // 删除 URL
  const handleDelete = (shortCode: string) => {
    setStoredShortCodes(prev => prev.filter(code => code !== shortCode));
    setUrls(prev => prev.filter(url => url.short_code !== shortCode));
    toast.success('URL deleted successfully');
  };

  // 获取排序图标
  const getSortIcon = (key: keyof URLInfoResponse) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ?
      <SortAsc className="h-4 w-4" /> :
      <SortDesc className="h-4 w-4" />;
  };

  // 效果钩子
  useEffect(() => {
    loadURLs();
  }, [storedShortCodes, refreshTrigger]);

  return (
    <div className={cn('w-full', className)}>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              URL Management ({filteredAndSortedUrls.length})
            </CardTitle>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Input
                  placeholder="Search URLs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                  className="sm:w-64"
                />
              </div>

              {selectedURLs.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    selectedURLs.forEach(handleDelete);
                    setSelectedURLs([]);
                  }}
                  icon={<Trash2 className="h-4 w-4" />}
                >
                  Delete Selected ({selectedURLs.length})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y divide-gray-200">
              {[...Array(3)].map((_, i) => (
                <TableRowSkeleton key={i} />
              ))}
            </div>
          ) : filteredAndSortedUrls.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {storedShortCodes.length === 0 ? 'No URLs yet' : 'No URLs found'}
              </h3>
              <p className="text-gray-600">
                {storedShortCodes.length === 0
                  ? 'Create your first short URL to see it here.'
                  : 'Try adjusting your search criteria.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {selectable && (
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedURLs.length === filteredAndSortedUrls.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedURLs(filteredAndSortedUrls.map(url => url.short_code));
                            } else {
                              setSelectedURLs([]);
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </th>
                    )}
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('original_url')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Original URL</span>
                        {getSortIcon('original_url')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('short_code')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Short Code</span>
                        {getSortIcon('short_code')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('access_count')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Clicks</span>
                        {getSortIcon('access_count')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Created</span>
                        {getSortIcon('created_at')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedUrls.map((url) => (
                    <tr
                      key={url.id}
                      className={cn(
                        'hover:bg-gray-50 transition-colors',
                        selectedURLs.includes(url.short_code) && 'bg-blue-50'
                      )}
                    >
                      {selectable && (
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedURLs.includes(url.short_code)}
                            onChange={() => handleURLSelect(url)}
                            className="rounded border-gray-300"
                          />
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {urlUtils.extractDomain(url.original_url)}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {urlUtils.truncateURL(url.original_url, 60)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {url.short_code}
                          </code>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {numberUtils.formatLarge(url.access_count)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {dateUtils.formatRelative(url.created_at)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(url.short_url, 'Short URL')}
                            icon={<Copy className="h-4 w-4" />}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVisit(url.short_url)}
                            icon={<ExternalLink className="h-4 w-4" />}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(url.short_code)}
                            icon={<Trash2 className="h-4 w-4" />}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default URLList;
```

## 📊 统计分析仪表板组件

### 组件设计思路

统计分析仪表板展示应用的各种数据指标：
- 关键指标卡片
- 交互式图表
- 时间范围选择
- 实时数据更新

### 核心特性

#### 1. 统计卡片组件
```typescript
interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  loading = false,
}) => {
  // 加载状态处理
  if (loading) {
    return <StatCardSkeleton />;
  }

  // 变化趋势颜色
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change && (
              <p className={`text-sm ${changeColors[changeType]} flex items-center mt-1`}>
                <TrendingUp className="h-4 w-4 mr-1" />
                {change}
              </p>
            )}
          </div>
          <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <div className="h-6 w-6 text-primary-600">
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

#### 2. 图表数据生成
```typescript
// 模拟时间序列数据
const generateTimeSeriesData = () => {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const labels = [];
  const urlsData = [];
  const clicksData = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

    // 模拟数据（实际项目中从 API 获取）
    urlsData.push(Math.floor(Math.random() * 50) + 10);
    clicksData.push(Math.floor(Math.random() * 200) + 50);
  }

  return { labels, urlsData, clicksData };
};
```

#### 3. 图表配置
```typescript
// Chart.js 配置
const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

// 线性图数据
const lineChartData = {
  labels: timeSeriesData.labels,
  datasets: [
    {
      label: 'URLs Created',
      data: timeSeriesData.urlsData,
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
    },
    {
      label: 'Total Clicks',
      data: timeSeriesData.clicksData,
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
    },
  ],
};
```

## 🔄 组件间通信

### 父子组件通信

#### 1. Props 传递
```typescript
// 父组件向子组件传递数据
<URLShortener
  onURLCreated={handleURLCreated}
  defaultValue=""
  autoFocus={true}
/>

// 子组件接收 Props
interface URLShortenerProps {
  onURLCreated?: (url: ShortenResponse) => void;
  defaultValue?: string;
  autoFocus?: boolean;
}
```

#### 2. 回调函数
```typescript
// 子组件通过回调通知父组件
const handleSubmit = async (e: React.FormEvent) => {
  // ... 处理逻辑
  const response = await createShortURL(shortenURL, { url: trimmedURL });

  // 通知父组件
  onURLCreated?.(response);
};
```

### 兄弟组件通信

#### 1. 状态提升
```typescript
// 父组件管理共享状态
const HomePage: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleURLCreated = (url: ShortenResponse) => {
    // 添加到本地存储
    addShortCode(url.short_code);

    // 触发列表刷新
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <URLShortener onURLCreated={handleURLCreated} />
      <URLList refreshTrigger={refreshTrigger} />
    </>
  );
};
```

#### 2. 自定义事件
```typescript
// 使用 CustomEvent 进行组件通信
const dispatchURLCreated = (url: ShortenResponse) => {
  const event = new CustomEvent('urlCreated', { detail: url });
  window.dispatchEvent(event);
};

// 监听自定义事件
useEffect(() => {
  const handleURLCreated = (event: CustomEvent) => {
    const url = event.detail;
    // 处理新创建的 URL
  };

  window.addEventListener('urlCreated', handleURLCreated);
  return () => window.removeEventListener('urlCreated', handleURLCreated);
}, []);
```

## 🎨 组件样式和主题

### 样式组织

#### 1. Tailwind CSS 类名
```typescript
// 使用 cn 工具函数合并类名
const buttonClasses = cn(
  'inline-flex items-center justify-center',
  'rounded-lg font-medium transition-all duration-200',
  'focus:outline-none focus:ring-2 focus:ring-offset-2',
  variant === 'primary' && 'bg-primary-600 text-white hover:bg-primary-700',
  size === 'sm' && 'px-3 py-1.5 text-sm',
  disabled && 'opacity-50 cursor-not-allowed',
  className
);
```

#### 2. 条件样式
```typescript
// 根据状态应用不同样式
<tr
  className={cn(
    'hover:bg-gray-50 transition-colors',
    selectedURLs.includes(url.short_code) && 'bg-blue-50',
    url.access_count > 100 && 'border-l-4 border-green-500'
  )}
>
```

#### 3. 响应式设计
```typescript
// 移动优先的响应式设计
<div className="flex flex-col sm:flex-row gap-3">
  <Input className="flex-1" />
  <Button className="sm:w-auto w-full">
    Shorten URL
  </Button>
</div>
```

## 📝 小结

本章我们开发了三个核心功能组件：

1. **URL 短链接生成器**：
   - 用户输入和验证
   - 异步操作处理
   - 结果展示和交互

2. **URL 列表管理**：
   - 数据展示和筛选
   - 排序和搜索功能
   - 批量操作支持

3. **统计分析仪表板**：
   - 数据可视化
   - 交互式图表
   - 实时数据更新

关键要点：
- 组件设计遵循单一职责原则
- 使用自定义 Hooks 管理状态和副作用
- 通过 Props 和回调实现组件通信
- 响应式设计适配多种设备
- 统一的错误处理和用户反馈

下一章我们将学习页面组件与路由的实现。