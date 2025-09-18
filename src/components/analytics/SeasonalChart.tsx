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
import { useIncidents } from '@/hooks/useIncidents'
import { CHART_COLORS } from '@/types'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface SeasonalChartProps {
  height?: number
}

export default function SeasonalChart({ height = 300 }: SeasonalChartProps) {
  const { incidents, isLoading, error } = useIncidents({ 
    page: 1, 
    limit: 1000 // Get all incidents for analysis
  })

  const chartData = useMemo(() => {
    if (!incidents || incidents.length === 0) {
      return {
        labels: [],
        datasets: []
      }
    }

    // Group incidents by month
    const monthlyData = incidents.reduce((acc, incident) => {
      const date = new Date(incident.incident_date)
      const month = date.getMonth() // 0-11
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]

    const labels = monthNames
    const data = monthNames.map((_, index) => monthlyData[index] || 0)

    // Color code by season
    const seasonColors = data.map((_, index) => {
      if (index >= 2 && index <= 4) return '#10B981' // Spring (Mar-May) - emerald
      if (index >= 5 && index <= 7) return '#F59E0B' // Summer (Jun-Aug) - amber
      if (index >= 8 && index <= 10) return '#EF4444' // Fall (Sep-Nov) - red
      return '#3B82F6' // Winter (Dec-Feb) - blue
    })

    return {
      labels,
      datasets: [
        {
          label: 'Incidents',
          data,
          backgroundColor: seasonColors.map(color => `${color}80`), // Add transparency
          borderColor: seasonColors,
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        }
      ]
    }
  }, [incidents])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
            return context[0].label
          },
          label: (context: any) => {
            const value = context.parsed.y
            return `${value} incident${value !== 1 ? 's' : ''}`
          },
          afterLabel: (context: any) => {
            const month = context.dataIndex
            let season = ''
            if (month >= 2 && month <= 4) season = 'Spring'
            else if (month >= 5 && month <= 7) season = 'Summer'
            else if (month >= 8 && month <= 10) season = 'Fall'
            else season = 'Winter'
            return `Season: ${season}`
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        border: {
          display: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
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

  if (!incidents || incidents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No seasonal data</h3>
          <p className="mt-1 text-sm text-gray-500">Record incidents throughout the year to see seasonal patterns</p>
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