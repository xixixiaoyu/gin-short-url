import React, { useState } from 'react';
import Head from 'next/head';
import { Zap, Shield, BarChart3, Globe } from 'lucide-react';
import URLShortener from '@/components/URLShortener';
import { Card, CardContent } from '@/components/ui/Card';
import { ShortenResponse } from '@/types/api';

const HomePage: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleURLCreated = (url: ShortenResponse) => {
    // 添加到本地存储
    if (typeof window !== 'undefined' && (window as any).addShortCode) {
      (window as any).addShortCode(url.short_code);
    }
    
    // 触发刷新
    setRefreshTrigger(prev => prev + 1);
  };

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Lightning Fast',
      description: 'Generate short URLs in milliseconds with our high-performance Go backend.',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Secure & Reliable',
      description: 'Built with security in mind, featuring input validation and error handling.',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Analytics Ready',
      description: 'Track clicks and monitor performance with detailed analytics.',
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: 'Global Access',
      description: 'Access your short URLs from anywhere with our cloud-ready infrastructure.',
    },
  ];

  return (
    <>
      <Head>
        <title>URL Shortener - Fast, Secure, and Reliable</title>
        <meta 
          name="description" 
          content="Create short URLs quickly and securely. Built with Go and Next.js for optimal performance." 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="space-y-12">
        {/* Hero Section */}
        <div className="text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Shorten URLs with
              <span className="text-primary-600"> Lightning Speed</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
              Transform long, unwieldy URLs into short, shareable links. 
              Built with modern technology for maximum performance and reliability.
            </p>
          </div>
        </div>

        {/* URL Shortener Component */}
        <URLShortener onURLCreated={handleURLCreated} />

        {/* Features Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Why Choose Our URL Shortener?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Built with cutting-edge technology for the best user experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <div className="text-primary-600">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-primary-600 rounded-2xl p-8 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-8">
              Trusted by Developers Worldwide
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold">1M+</div>
                <div className="text-primary-100">URLs Shortened</div>
              </div>
              <div>
                <div className="text-3xl font-bold">99.9%</div>
                <div className="text-primary-100">Uptime</div>
              </div>
              <div>
                <div className="text-3xl font-bold">&lt;100ms</div>
                <div className="text-primary-100">Response Time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Built with Modern Technology
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">Go</span>
              </div>
              <span>Go Backend</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">▲</span>
              </div>
              <span>Next.js Frontend</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TS</span>
              </div>
              <span>TypeScript</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TW</span>
              </div>
              <span>Tailwind CSS</span>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gray-100 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 mb-6">
            Start shortening your URLs today. No registration required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#top"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              Create Short URL
            </a>
            <a
              href="/manage"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Manage URLs
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
