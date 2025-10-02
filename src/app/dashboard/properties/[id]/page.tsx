'use client'

import { trpc } from '@/trpc/client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function PropertyDetailPage() {
  const params = useParams() as { id: string }
  const id = params.id
  const { data: property, isLoading } = trpc.property.byId.useQuery({ id })
  const { data: units, isLoading: unitsLoading } = trpc.unit.listByProperty.useQuery({ propertyId: id })

  if (isLoading) return <div>Loading...</div>
  if (!property) return <div>Not found</div>

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{property.name}</h2>
          <div className="text-sm text-muted-foreground">
            {property.address1}, {property.city}, {property.state} {property.postalCode}
          </div>
          <div className="text-xs text-gray-500 mt-1 capitalize">{property.type}</div>
        </div>
        <Link href={`/dashboard/properties/${id}/units/new`}>
          <Button>Add Unit</Button>
        </Link>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">Units</h3>
        {unitsLoading ? (
          <div>Loading units...</div>
        ) : units && units.length > 0 ? (
          <ul className="divide-y rounded-lg border">
            {units.map((u: any) => (
              <li key={u.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">Unit {u.unitNumber}</div>
                  <div className="text-sm text-muted-foreground">
                    {u.bedrooms} bd • {u.bathrooms} ba • {u.squareFeet ?? '—'} ft²
                  </div>
                </div>
                <div className="text-sm capitalize">{u.status}</div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-lg border p-8 text-center text-muted-foreground">
            No units yet. Add your first one.
          </div>
        )}
      </div>
    </div>
  )
}