import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Link, 
  Activity,
  Calendar,
  Globe,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatCardSkeleton } from '@/components/ui/LoadingSpinner';
import { useAPI } from '@/hooks/useAPI';
import { getStats } from '@/lib/api';
import { numberUtils, dateUtils } from '@/utils';

// 注册 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

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
  if (loading) {
    return <StatCardSkeleton />;
  }

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

const StatsPage: React.FC = () => {
  const { data: stats, loading, error, refetch } = useAPI(getStats);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

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
      
      // 模拟数据
      urlsData.push(Math.floor(Math.random() * 50) + 10);
      clicksData.push(Math.floor(Math.random() * 200) + 50);
    }

    return { labels, urlsData, clicksData };
  };

  const timeSeriesData = generateTimeSeriesData();

  // 图表配置
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

  const doughnutData = {
    labels: ['Active URLs', 'Low Activity', 'High Activity'],
    datasets: [
      {
        data: [65, 25, 10],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(156, 163, 175, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(156, 163, 175, 1)',
          'rgba(16, 185, 129, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const barChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Daily Clicks',
        data: [120, 190, 300, 500, 200, 300, 450],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Failed to load statistics
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={refetch}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Monitor your URL shortening performance</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total URLs"
          value={stats ? numberUtils.formatLarge(stats.total_urls) : '0'}
          change="+12% from last month"
          changeType="positive"
          icon={<Link />}
          loading={loading}
        />
        <StatCard
          title="Total Clicks"
          value={stats ? numberUtils.formatLarge(stats.total_accesses) : '0'}
          change="+8% from last month"
          changeType="positive"
          icon={<TrendingUp />}
          loading={loading}
        />
        <StatCard
          title="Click Rate"
          value="6.7"
          change="+2.1% from last month"
          changeType="positive"
          icon={<BarChart3 />}
          loading={loading}
        />
        <StatCard
          title="Active URLs"
          value="89%"
          change="-1.2% from last month"
          changeType="negative"
          icon={<Activity />}
          loading={loading}
        />
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 趋势图 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              URL Creation & Click Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line data={lineChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* URL 活跃度分布 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              URL Activity Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Doughnut 
                data={doughnutData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* 每日点击量 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Daily Click Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar 
                data={barChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 详细统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Response Time</span>
              <span className="font-medium">245ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Success Rate</span>
              <span className="font-medium text-green-600">99.8%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Memory Usage</span>
              <span className="font-medium">
                {stats ? numberUtils.formatBytes(stats.memory_usage || 0) : '0 B'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="font-medium text-green-600">99.9%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Domains
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { domain: 'github.com', count: 45 },
              { domain: 'google.com', count: 32 },
              { domain: 'stackoverflow.com', count: 28 },
              { domain: 'medium.com', count: 21 },
              { domain: 'youtube.com', count: 18 },
            ].map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{item.domain}</span>
                <span className="font-medium">{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { action: 'URL created', time: '2 minutes ago' },
              { action: 'URL accessed', time: '5 minutes ago' },
              { action: 'URL created', time: '12 minutes ago' },
              { action: 'URL accessed', time: '18 minutes ago' },
              { action: 'URL created', time: '25 minutes ago' },
            ].map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{item.action}</span>
                <span className="text-xs text-gray-500">{item.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatsPage;
