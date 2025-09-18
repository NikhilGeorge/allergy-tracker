'use client'

import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useTriggerFrequency } from '@/hooks/useAnalytics'
import { CHART_COLORS } from '@/types'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface TriggerChartProps {
  limit?: number
  height?: number
  horizontal?: boolean
}

export default function TriggerChart({ 
  limit = 10, 
  height = 300,
  horizontal = false 
}: TriggerChartProps) {
  const { triggers, isLoading, error } = useTriggerFrequency(limit)

  const chartData = useMemo(() => {
    if (!triggers || triggers.length === 0) {
      return {
        labels: [],
        datasets: []
      }
    }

    // Sort by frequency and take top items
    const sortedTriggers = [...triggers]
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)

    const labels = sortedTriggers.map(trigger => 
      trigger.trigger.length > 15 
        ? `${trigger.trigger.substring(0, 15)}...` 
        : trigger.trigger
    )
    const data = sortedTriggers.map(trigger => trigger.count)
    
    // Color code by category
    const colors = sortedTriggers.map(trigger => {
      switch (trigger.category) {
        case 'food':
          return '#F59E0B' // amber
        case 'activity':
          return '#10B981' // emerald
        case 'environmental':
          return '#3B82F6' // blue
        case 'medication':
          return '#8B5CF6' // violet
        default:
          return CHART_COLORS.primary
      }
    })

    return {
      labels,
      datasets: [
        {
          label: 'Frequency',
          data,
          backgroundColor: colors.map(color => `${color}80`), // Add transparency
          borderColor: colors,
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        }
      ]
    }
  }, [triggers, limit])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' as const : 'x' as const,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#ffffff',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context: any) => {
            const fullLabel = triggers?.[context[0].dataIndex]?.trigger || context[0].label
            return fullLabel
          },
          label: (context: any) => {
            const trigger = triggers?.[context.dataIndex]
            const count = context.parsed[horizontal ? 'x' : 'y']
            const percentage = trigger?.percentage || 0
            return `${count} incidents (${percentage}%)`
          },
          afterLabel: (context: any) => {
            const trigger = triggers?.[context.dataIndex]
            return trigger ? `Category: ${trigger.category}` : ''
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: !horizontal,
          color: '#F3F4F6',
          drawBorder: false
        },
        border: {
          display: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          },
          maxRotation: horizontal ? 0 : 45,
          callback: horizontal ? undefined : (value: any, index: number) => {
            const label = chartData.labels[index]
            return typeof label === 'string' && label.length > 10 
              ? `${label.substring(0, 10)}...` 
              : label
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          display: horizontal,
          color: '#F3F4F6',
          drawBorder: false
        },
        border: {
          display: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          },
          stepSize: 1,
          callback: (value: any) => {
            return Number.isInteger(value) ? value : ''
          }
        }
      }
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading chart</h3>
          <p className="mt-1 text-sm text-gray-500">{error.message}</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!triggers || triggers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No triggers found</h3>
          <p className="mt-1 text-sm text-gray-500">Record incidents with foods and activities to see triggers</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height }}>
      <Bar data={chartData} options={options} />
    </div>
  )
}