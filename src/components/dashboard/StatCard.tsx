'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'
  isLoading?: boolean
  className?: string
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    value: 'text-blue-600',
    trend: {
      positive: 'text-green-600',
      negative: 'text-red-600'
    }
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    value: 'text-green-600',
    trend: {
      positive: 'text-green-600',
      negative: 'text-red-600'
    }
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'text-yellow-600',
    value: 'text-yellow-600',
    trend: {
      positive: 'text-green-600',
      negative: 'text-red-600'
    }
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    value: 'text-red-600',
    trend: {
      positive: 'text-green-600',
      negative: 'text-red-600'
    }
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    value: 'text-purple-600',
    trend: {
      positive: 'text-green-600',
      negative: 'text-red-600'
    }
  },
  gray: {
    bg: 'bg-gray-50',
    icon: 'text-gray-600',
    value: 'text-gray-900',
    trend: {
      positive: 'text-green-600',
      negative: 'text-red-600'
    }
  }
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'gray',
  isLoading = false,
  className
}: StatCardProps) {
  const colors = colorClasses[color]

  if (isLoading) {
    return (
      <div className={cn('bg-white rounded-lg shadow p-6', className)}>
        <div className="animate-pulse">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <div className="bg-gray-200 h-4 w-24 rounded mb-2"></div>
              <div className="bg-gray-200 h-8 w-16 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-white rounded-lg shadow p-6', className)}>
      <div className="flex items-center">
        {icon && (
          <div className="flex-shrink-0">
            <div className={cn('p-2 rounded-md', colors.bg)}>
              <div className={cn('w-6 h-6', colors.icon)}>
                {icon}
              </div>
            </div>
          </div>
        )}
        
        <div className={cn('w-0 flex-1', icon && 'ml-5')}>
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className={cn('text-2xl font-semibold', colors.value)}>
                {value}
              </div>
              {trend && (
                <div className="ml-2 flex items-baseline text-sm">
                  <span
                    className={cn(
                      'font-medium',
                      trend.isPositive !== false 
                        ? colors.trend.positive 
                        : colors.trend.negative
                    )}
                  >
                    {trend.isPositive !== false ? '+' : ''}{trend.value}
                  </span>
                  <span className="ml-1 text-gray-500">
                    {trend.label}
                  </span>
                </div>
              )}
            </dd>
            {subtitle && (
              <dd className="text-sm text-gray-500 mt-1">
                {subtitle}
              </dd>
            )}
          </dl>
        </div>
      </div>
    </div>
  )
}