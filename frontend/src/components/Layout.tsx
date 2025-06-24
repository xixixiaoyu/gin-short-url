import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Link2, 
  BarChart3, 
  List, 
  Menu, 
  X, 
  Github,
  Heart,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useOnlineStatus } from '@/hooks/useAPI';
import { cn } from '@/utils';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const isOnline = useOnlineStatus();

  const navigation: NavItem[] = [
    {
      name: 'Home',
      href: '/',
      icon: <Link2 className="h-5 w-5" />,
      description: 'Create short URLs',
    },
    {
      name: 'Manage',
      href: '/manage',
      icon: <List className="h-5 w-5" />,
      description: 'View and manage your URLs',
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      description: 'View statistics and insights',
    },
  ];

  const isActivePage = (href: string) => {
    if (href === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 离线状态提示 */}
      {!isOnline && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <div className="flex items-center justify-center">
            <p className="text-sm text-yellow-800">
              You're currently offline. Some features may not work properly.
            </p>
          </div>
        </div>
      )}

      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo 和主导航 */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    URL Shortener
                  </span>
                </Link>
              </div>
              
              {/* 桌面导航 */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors',
                      isActivePage(item.href)
                        ? 'border-primary-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    )}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* 右侧按钮 */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
              <a
                href="https://github.com/yourusername/gin-url-shortener"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>

            {/* 移动端菜单按钮 */}
            <div className="sm:hidden flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                icon={mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              >
                Menu
              </Button>
            </div>
          </div>
        </div>

        {/* 移动端导航菜单 */}
        {mobileMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors',
                    isActivePage(item.href)
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <span className="mr-3">{item.icon}</span>
                    <div>
                      <div>{item.name}</div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>using Next.js and Go</span>
            </div>
            
            <div className="flex items-center space-x-6 mt-4 sm:mt-0">
              <a
                href="https://github.com/yourusername/gin-url-shortener"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                GitHub
              </a>
              <a
                href="/api/health"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                API Status
              </a>
              <span className="text-sm text-gray-500">
                v1.0.0
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
