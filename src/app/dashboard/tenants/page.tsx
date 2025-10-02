'use client'

import { trpc } from '@/trpc/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function TenantsListPage() {
  const { data: tenants, isLoading } = trpc.tenant.list.useQuery()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Tenants</h2>
        <Link href="/dashboard/tenants/new">
          <Button>Add Tenant</Button>
        </Link>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : tenants && tenants.length > 0 ? (
        <ul className="divide-y rounded-lg border">
          {tenants.map((t: any) => (
            <li key={t.id} className="p-4">
              <div className="font-medium">
                {t.firstName} {t.lastName}
              </div>
              <div className="text-sm text-muted-foreground">{t.email}</div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          No tenants yet. Create your first one.
        </div>
      )}
    </div>
  )
}