import Link from 'next/link'
import PageHeader from '@/components/layout/PageHeader'
import IncidentList from '@/components/incidents/IncidentList'

export const dynamic = 'force-dynamic'

export default function IncidentsPage() {
  return (
    <div>
      <PageHeader
        title="Allergy Incidents"
        description="View and manage your allergy incident history"
        actions={
          <Link
            href="/incidents/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Add New Incident
          </Link>
        }
      />
      
      <IncidentList />
    </div>
  )
}