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
}

const URLShortener: React.FC<URLShortenerProps> = ({ 
  onURLCreated, 
  className 
}) => {
  const [inputURL, setInputURL] = useState('');
  const [validationError, setValidationError] = useState('');
  const [result, setResult] = useState<ShortenResponse | null>(null);
  
  const { execute: createShortURL, loading } = useAsyncOperation<ShortenResponse>();
  const { copy, isCopied } = useCopyToClipboard();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputURL(value);
    
    // 清除之前的错误
    if (validationError) {
      setValidationError('');
    }
    
    // 清除结果
    if (result) {
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputURL.trim()) {
      setValidationError('Please enter a URL');
      return;
    }

    // 验证 URL 格式
    const validation = validateURL(inputURL.trim());
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid URL format');
      return;
    }

    try {
      const response = await createShortURL(shortenURL, { url: inputURL.trim() });
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

  const handleCopy = async (text: string) => {
    const success = await copy(text);
    if (success) {
      toast.success('Copied to clipboard!');
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

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
