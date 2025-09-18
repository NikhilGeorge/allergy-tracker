'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface VirtualizedListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  overscan?: number
  onScroll?: (scrollTop: number) => void
}

export default function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5,
  onScroll
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const { visibleItems, totalHeight, offsetY } = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight)
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    )

    const start = Math.max(0, visibleStart - overscan)
    const end = Math.min(items.length - 1, visibleEnd + overscan)

    const visibleItems = []
    for (let i = start; i <= end; i++) {
      visibleItems.push({
        index: i,
        item: items[i]
      })
    }

    return {
      visibleItems,
      totalHeight: items.length * itemHeight,
      offsetY: start * itemHeight
    }
  }, [items, itemHeight, scrollTop, containerHeight, overscan])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop
    setScrollTop(newScrollTop)
    onScroll?.(newScrollTop)
  }

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map(({ item, index }) => (
            <div
              key={index}
              style={{ height: itemHeight }}
              className="flex items-center"
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Specialized virtualized incident list
interface VirtualizedIncidentListProps {
  incidents: any[]
  onIncidentClick?: (incident: any) => void
  className?: string
}

export function VirtualizedIncidentList({
  incidents,
  onIncidentClick,
  className
}: VirtualizedIncidentListProps) {
  return (
    <VirtualizedList
      items={incidents}
      itemHeight={80}
      containerHeight={400}
      className={className}
      renderItem={(incident, index) => (
        <div
          key={incident.id}
          className="w-full p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() => onIncidentClick?.(incident)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {incident.symptoms?.slice(0, 2).join(', ')}
                {incident.symptoms?.length > 2 && ` +${incident.symptoms.length - 2} more`}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(incident.incident_date).toLocaleDateString()} • {incident.severity}
              </p>
            </div>
            <div className="flex-shrink-0 ml-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: {
                    'Mild': '#10b981',
                    'Moderate': '#f59e0b',
                    'Severe': '#ef4444'
                  }[incident.severity]
                }}
              />
            </div>
          </div>
        </div>
      )}
    />
  )
}