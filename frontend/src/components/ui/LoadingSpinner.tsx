import React from 'react';
import { cn } from '@/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  text,
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const spinner = (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex flex-col items-center space-y-2">
        <Loader2 
          className={cn(
            'animate-spin text-primary-600',
            sizeClasses[size]
          )} 
        />
        {text && (
          <p className={cn(
            'text-gray-600 font-medium',
            textSizeClasses[size]
          )}>
            {text}
          </p>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// 骨架屏组件
interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  rounded = false,
}) => {
  const style: React.CSSProperties = {};
  
  if (width) {
    style.width = typeof width === 'number' ? `${width}px` : width;
  }
  
  if (height) {
    style.height = typeof height === 'number' ? `${height}px` : height;
  }

  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200',
        rounded ? 'rounded-full' : 'rounded',
        className
      )}
      style={style}
    />
  );
};

// 卡片骨架屏
const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="space-y-2">
        <Skeleton height={20} width="60%" />
        <Skeleton height={16} width="40%" />
      </div>
      <div className="space-y-2">
        <Skeleton height={16} width="100%" />
        <Skeleton height={16} width="80%" />
        <Skeleton height={16} width="90%" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton height={16} width="30%" />
        <Skeleton height={32} width={80} />
      </div>
    </div>
  );
};

// 表格行骨架屏
const TableRowSkeleton: React.FC = () => {
  return (
    <tr className="border-b border-gray-200">
      <td className="px-6 py-4">
        <Skeleton height={16} width="80%" />
      </td>
      <td className="px-6 py-4">
        <Skeleton height={16} width="60%" />
      </td>
      <td className="px-6 py-4">
        <Skeleton height={16} width="40%" />
      </td>
      <td className="px-6 py-4">
        <Skeleton height={16} width="30%" />
      </td>
      <td className="px-6 py-4">
        <div className="flex space-x-2">
          <Skeleton height={32} width={32} />
          <Skeleton height={32} width={32} />
        </div>
      </td>
    </tr>
  );
};

// 统计卡片骨架屏
const StatCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton height={16} width={100} />
          <Skeleton height={32} width={80} />
        </div>
        <Skeleton height={48} width={48} rounded />
      </div>
    </div>
  );
};

export { 
  LoadingSpinner, 
  Skeleton, 
  CardSkeleton, 
  TableRowSkeleton, 
  StatCardSkeleton 
};

export type { LoadingSpinnerProps, SkeletonProps };
