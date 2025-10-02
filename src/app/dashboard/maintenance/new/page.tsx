'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { MaintenanceValidator, TMaintenanceValidator } from '@/lib/validators/maintenance'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { trpc } from '@/trpc/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useMemo } from 'react'

export default function NewMaintenancePage() {
  const router = useRouter()
  const { data: orgs } = trpc.organization.listMine.useQuery()
  const { data: properties } = trpc.property.list.useQuery()
  const selectedPropertyId = useMemo(() => properties?.[0]?.id as string | undefined, [properties])
  const { data: units } = trpc.unit.listByProperty.useQuery(
    { propertyId: selectedPropertyId || '' },
    { enabled: !!selectedPropertyId }
  )
  const { data: tenants } = trpc.tenant.list.useQuery()

  const { mutate: createMaint, isLoading } = trpc.maintenance.create.useMutation({
    onSuccess: () => {
      toast.success('Request created')
      router.push(`/dashboard/maintenance`)
    },
    onError: () => toast.error('Failed to create request'),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TMaintenanceValidator>({
    resolver: zodResolver(MaintenanceValidator),
  })

  const onSubmit = (values: TMaintenanceValidator) => {
    createMaint(values)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">New Maintenance Request</h2>
        <p className="text-sm text-muted-foreground">Create a maintenance request for a unit or property.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>Organization</Label>
          <select
            {...register('organizationId')}
            className={cn('border h-10 px-3 rounded-md w-full bg-white', {
              'ring-1 ring-red-500': errors.organizationId,
            })}
          >
            <option value="">Select organization</option>
            {orgs?.map((o: any) => (
              <option value={o.id} key={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          {errors.organizationId && (
            <p className="text-sm text-red-500">{errors.organizationId.message as any}</p>
          )}
        </div>

        <div>
          <Label>Property</Label>
          <select
            {...register('propertyId')}
            className={cn('border h-10 px-3 rounded-md w-full bg-white', {
              'ring-1 ring-red-500': errors.propertyId,
            })}
          >
            <option value="">Select property</option>
            {properties?.map((p: any) => (
              <option value={p.id} key={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {errors.propertyId && <p className="text-sm text-red-500">{errors.propertyId.message as any}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Unit (optional)</Label>
            <select {...register('unitId')} className="border h-10 px-3 rounded-md w-full bg-white">
              <option value="">—</option>
              {units?.map((u: any) => (
                <option value={u.id} key={u.id}>
                  {u.unitNumber}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Tenant (optional)</Label>
            <select {...register('tenantId')} className="border h-10 px-3 rounded-md w-full bg-white">
              <option value="">—</option>
              {tenants?.map((t: any) => (
                <option value={t.id} key={t.id}>
                  {t.firstName} {t.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label>Title</Label>
          <Input {...register('title')} className={cn({ 'focus-visible:ring-red-500': errors.title })} />
        </div>

        <div>
          <Label>Description</Label>
          <textarea
            {...register('description')}
            className={cn('border rounded-md w-full min-h-[120px] p-3', {
              'ring-1 ring-red-500': errors.description,
            })}
          />
        </div>

        <div>
          <Label>Priority</Label>
          <select {...register('priority')} className="border h-10 px-3 rounded-md w-full bg-white">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>

        <Button disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Request'}</Button>
      </form>
    </div>
  )
}