'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { UnitValidator, TUnitValidator } from '@/lib/validators/unit'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { trpc } from '@/trpc/client'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function NewUnitPage() {
  const router = useRouter()
  const params = useParams() as { id: string }
  const propertyId = params.id

  const { mutate: createUnit, isLoading } = trpc.unit.create.useMutation({
    onSuccess: () => {
      toast.success('Unit created')
      router.push(`/dashboard/properties/${propertyId}`)
    },
    onError: () => toast.error('Failed to create unit'),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TUnitValidator>({
    resolver: zodResolver(UnitValidator),
    defaultValues: {
      propertyId,
      status: 'vacant',
      bedrooms: 1,
      bathrooms: 1,
    } as any,
  })

  const onSubmit = (values: TUnitValidator) => {
    createUnit(values)
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Add Unit</h2>
        <p className="text-sm text-muted-foreground">Create a new unit for this property.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register('propertyId')} />

        <div>
          <Label>Unit Number</Label>
          <Input {...register('unitNumber')} className={cn({ 'focus-visible:ring-red-500': errors.unitNumber })} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Bedrooms</Label>
            <Input type="number" {...register('bedrooms', { valueAsNumber: true })} />
          </div>
          <div>
            <Label>Bathrooms</Label>
            <Input type="number" {...register('bathrooms', { valueAsNumber: true })} />
          </div>
          <div>
            <Label>Rent (USD)</Label>
            <Input type="number" {...register('rent', { valueAsNumber: true })} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Square Feet</Label>
            <Input type="number" {...register('squareFeet', { valueAsNumber: true })} />
          </div>
          <div>
            <Label>Status</Label>
            <select
              {...register('status')}
              className="border h-10 px-3 rounded-md w-full bg-white"
            >
              <option value="vacant">Vacant</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        <Button disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Unit'}</Button>
      </form>
    </div>
  )
}