'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { PropertyValidator, TPropertyValidator } from '@/lib/validators/property'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { trpc } from '@/trpc/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function NewPropertyPage() {
  const router = useRouter()
  const { data: orgs } = trpc.organization.listMine.useQuery()
  const { mutate: createProperty, isLoading } = trpc.property.create.useMutation({
    onSuccess: (p) => {
      toast.success('Property created')
      router.push(`/dashboard/properties/${p.id}`)
    },
    onError: () => toast.error('Failed to create property'),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TPropertyValidator>({
    resolver: zodResolver(PropertyValidator),
    defaultValues: {
      country: 'USA',
      type: 'residential',
    } as any,
  })

  const onSubmit = (values: TPropertyValidator) => {
    createProperty(values)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Add Property</h2>
        <p className="text-sm text-muted-foreground">Create a new property under an organization.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Name</Label>
            <Input {...register('name')} className={cn({ 'focus-visible:ring-red-500': errors.name })} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <Label>Type</Label>
            <select
              {...register('type')}
              className={cn(
                'border h-10 px-3 rounded-md w-full bg-white',
                { 'ring-1 ring-red-500': errors.type }
              )}>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="mixed">Mixed Use</option>
            </select>
            {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
          </div>
        </div>

        <div>
          <Label>Organization</Label>
          <select
            {...register('organizationId')}
            className={cn(
              'border h-10 px-3 rounded-md w-full bg-white',
              { 'ring-1 ring-red-500': errors.organizationId }
            )}>
            <option value="">Personal (auto)</option>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Address 1</Label>
            <Input {...register('address1')} className={cn({ 'focus-visible:ring-red-500': errors.address1 })} />
          </div>
          <div>
            <Label>Address 2</Label>
            <Input {...register('address2')} />
          </div>
          <div>
            <Label>City</Label>
            <Input {...register('city')} className={cn({ 'focus-visible:ring-red-500': errors.city })} />
          </div>
          <div>
            <Label>State</Label>
            <Input {...register('state')} className={cn({ 'focus-visible:ring-red-500': errors.state })} />
          </div>
          <div>
            <Label>Postal Code</Label>
            <Input {...register('postalCode')} className={cn({ 'focus-visible:ring-red-500': errors.postalCode })} />
          </div>
          <div>
            <Label>Country</Label>
            <Input {...register('country')} className={cn({ 'focus-visible:ring-red-500': errors.country })} />
          </div>
        </div>

        <div>
          <Label>Description</Label>
          <textarea
            {...register('description')}
            className="border rounded-md w-full min-h-[100px] p-3"
            placeholder="Optional details"
          />
        </div>

        <Button disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Property'}</Button>
      </form>
    </div>
  )
}