import React, { useState } from 'react';
import Head from 'next/head';
import { List, Plus } from 'lucide-react';
import URLList from '@/components/URLList';
import URLShortener from '@/components/URLShortener';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ShortenResponse } from '@/types/api';

const ManagePage: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleURLCreated = (url: ShortenResponse) => {
    // 添加到本地存储
    if (typeof window !== 'undefined' && (window as any).addShortCode) {
      (window as any).addShortCode(url.short_code);
    }
    
    // 触发刷新
    setRefreshTrigger(prev => prev + 1);
    
    // 隐藏创建表单
    setShowCreateForm(false);
  };

  return (
    <>
      <Head>
        <title>Manage URLs - URL Shortener</title>
        <meta 
          name="description" 
          content="Manage and monitor your shortened URLs. View statistics, copy links, and track performance." 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <List className="h-6 w-6" />
              Manage URLs
            </h1>
            <p className="text-gray-600 mt-1">
              View, manage, and monitor your shortened URLs
            </p>
          </div>
          
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            icon={<Plus className="h-4 w-4" />}
            className="sm:w-auto w-full"
          >
            Create New URL
          </Button>
        </div>

        {/* 创建新 URL 表单 */}
        {showCreateForm && (
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle>Create New Short URL</CardTitle>
            </CardHeader>
            <CardContent>
              <URLShortener 
                onURLCreated={handleURLCreated}
                className="max-w-none"
              />
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* URL 列表 */}
        <URLList refreshTrigger={refreshTrigger} />

        {/* 帮助信息 */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              💡 Pro Tips
            </h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• Click on any short URL to copy it to your clipboard</li>
              <li>• Use the search box to quickly find specific URLs</li>
              <li>• Sort by creation date or click count to organize your links</li>
              <li>• Your URLs are stored locally in your browser</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ManagePage;
