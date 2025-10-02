'use client'

import { trpc } from '@/trpc/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const { data: orgs, isLoading: orgLoading } = trpc.organization.listMine.useQuery()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Overview</h2>
          <p className="text-sm text-muted-foreground">
            Manage properties, units, tenants, and maintenance across your organizations.
          </p>
        </div>
        <Link href="/dashboard/properties/new">
          <Button>Add Property</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">Organizations</div>
          <div className="text-2xl font-semibold mt-2">
            {orgLoading ? '—' : orgs?.length ?? 0}
          </div>
          <div className="mt-4">
            <Link href="/dashboard/properties" className="text-sm text-blue-600">
              Go to Properties →
            </Link>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">Tenants</div>
          <div className="text-2xl font-semibold mt-2">—</div>
          <div className="mt-4">
            <Link href="/dashboard/tenants" className="text-sm text-blue-600">
              Go to Tenants →
            </Link>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">Open Maintenance</div>
          <div className="text-2xl font-semibold mt-2">—</div>
          <div className="mt-4">
            <Link href="/dashboard/maintenance" className="text-sm text-blue-600">
              Go to Maintenance →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}