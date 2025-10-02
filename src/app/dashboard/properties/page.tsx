'use client'

import { trpc } from '@/trpc/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

export default function PropertiesListPage() {
  const { data: properties, isLoading } = trpc.property.list.useQuery()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Properties</h2>
        <Link href="/dashboard/properties/new">
          <Button>Add Property</Button>
        </Link>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : properties && properties.length > 0 ? (
        <ul className="divide-y rounded-lg border">
          {properties.map((p: any) => (
            <li key={p.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-muted-foreground">
                  {p.address1}, {p.city}, {p.state} {p.postalCode}
                </div>
                <div className="text-xs text-gray-500 mt-1 capitalize">{p.type}</div>
              </div>
              <div className="flex items-center gap-4">
                <Link href={`/dashboard/properties/${p.id}`}>
                  <Button variant="secondary">Open</Button>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          No properties yet. Create your first one.
        </div>
      )}
    </div>
  )
}