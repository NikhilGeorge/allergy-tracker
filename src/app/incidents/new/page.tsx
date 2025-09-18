import PageHeader from '@/components/layout/PageHeader'
import { LazyIncidentForm } from '@/components/forms/LazyIncidentForm'

export const dynamic = 'force-dynamic'

export default function NewIncidentPage() {
  return (
    <div>
      <PageHeader
        title="Add New Incident"
        description="Record details about your allergy incident"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Incidents', href: '/incidents' },
          { label: 'New Incident' }
        ]}
      />
      
      <LazyIncidentForm />
    </div>
  )
}