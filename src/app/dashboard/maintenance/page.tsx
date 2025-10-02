'use client'

import { trpc } from '@/trpc/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function MaintenanceListPage() {
  const { data: items, isLoading } = trpc.maintenance.list.useQuery()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Maintenance</h2>
        <Link href="/dashboard/maintenance/new">
          <Button>New Request</Button>
        </Link>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : items && items.length > 0 ? (
        <ul className="divide-y rounded-lg border">
          {items.map((m: any) => (
            <li key={m.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{m.title}</div>
                <div className="text-sm text-muted-foreground">
                  {m.property?.name} {m.unit ? `• Unit ${m.unit.unitNumber}` : ''}
                </div>
              </div>
              <div className="text-sm capitalize">{m.status}</div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          No maintenance requests yet.
        </div>
      )}
    </div>
  )
}