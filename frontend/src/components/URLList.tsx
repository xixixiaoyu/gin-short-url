import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Copy, 
  ExternalLink, 
  Eye, 
  Calendar,
  TrendingUp,
  Filter,
  SortAsc,
  SortDesc
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
}

interface SortConfig {
  key: keyof URLInfoResponse;
  direction: 'asc' | 'desc';
}

const URLList: React.FC<URLListProps> = ({ refreshTrigger, className }) => {
  const [urls, setUrls] = useState<URLInfoResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    key: 'created_at', 
    direction: 'desc' 
  });
  
  // 本地存储的短码列表
  const [storedShortCodes, setStoredShortCodes] = useLocalStorage<string[]>('shortCodes', []);
  
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

  // 添加新的短码到列表
  const addShortCode = (shortCode: string) => {
    if (!storedShortCodes.includes(shortCode)) {
      setStoredShortCodes(prev => [shortCode, ...prev]);
    }
  };

  // 从列表中移除短码
  const removeShortCode = (shortCode: string) => {
    setStoredShortCodes(prev => prev.filter(code => code !== shortCode));
    setUrls(prev => prev.filter(url => url.short_code !== shortCode));
  };

  // 过滤和排序 URLs
  const filteredAndSortedUrls = React.useMemo(() => {
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

  // 获取排序图标
  const getSortIcon = (key: keyof URLInfoResponse) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? 
      <SortAsc className="h-4 w-4" /> : 
      <SortDesc className="h-4 w-4" />;
  };

  useEffect(() => {
    loadURLs();
  }, [storedShortCodes, refreshTrigger]);

  // 暴露添加短码的方法给父组件
  useEffect(() => {
    // 这里可以通过 ref 或其他方式暴露 addShortCode 方法
    (window as any).addShortCode = addShortCode;
    return () => {
      delete (window as any).addShortCode;
    };
  }, [addShortCode]);

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
                    <tr key={url.id} className="hover:bg-gray-50">
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
