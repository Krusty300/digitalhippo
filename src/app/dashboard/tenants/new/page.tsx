'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { TenantValidator, TTenantValidator } from '@/lib/validators/tenant'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { trpc } from '@/trpc/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function NewTenantPage() {
  const router = useRouter()
  const { data: orgs } = trpc.organization.listMine.useQuery()
  const { mutate: createTenant, isLoading } = trpc.tenant.create.useMutation({
    onSuccess: () => {
      toast.success('Tenant created')
      router.push(`/dashboard/tenants`)
    },
    onError: () => toast.error('Failed to create tenant'),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TTenantValidator>({
    resolver: zodResolver(TenantValidator),
  })

  const onSubmit = (values: TTenantValidator) => {
    createTenant(values)
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Add Tenant</h2>
        <p className="text-sm text-muted-foreground">Create a new tenant under an organization.</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>First Name</Label>
            <Input {...register('firstName')} className={cn({ 'focus-visible:ring-red-500': errors.firstName })} />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input {...register('lastName')} className={cn({ 'focus-visible:ring-red-500': errors.lastName })} />
          </div>
        </div>

        <div>
          <Label>Email</Label>
          <Input {...register('email')} className={cn({ 'focus-visible:ring-red-500': errors.email })} />
        </div>

        <div>
          <Label>Phone</Label>
          <Input {...register('phone')} />
        </div>

        <div>
          <Label>Notes</Label>
          <textarea {...register('notes')} className="border rounded-md w-full min-h-[100px] p-3" />
        </div>

        <Button disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Tenant'}</Button>
      </form>
    </div>
  )
}