'use client'

import dynamic from 'next/dynamic'
import { CardLoading } from '@/components/ui/LoadingSpinner'

// Lazy load the incident form with loading fallback
export const LazyIncidentForm = dynamic(
  () => import('./IncidentForm'),
  {
    loading: () => (
      <div className="space-y-6">
        <CardLoading />
        <CardLoading />
        <CardLoading />
      </div>
    ),
    ssr: false
  }
)