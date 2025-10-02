import { getPayloadClient } from '@/get-payload'
import { TenantValidator } from '@/lib/validators/tenant'
import { privateProcedure, router } from './trpc'
import { z } from 'zod'

export const tenantRouter = router({
  list: privateProcedure
    .input(
      z
        .object({
          organizationId: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input, ctx }) => {
      const payload = await getPayloadClient()
      const {
        req: { user },
      } = ctx as any

      let organizationFilter: any = undefined
      if (input?.organizationId) {
        organizationFilter = { equals: input.organizationId }
      } else {
        const orgs = await payload.find({
          collection: 'organizations',
          where: { 'members.user': { equals: user.id } },
          limit: 100,
        })
        const orgIds = orgs.docs.map((o) => o.id as string)
        organizationFilter = { in: orgIds.length ? orgIds : ['___none___'] }
      }

      const { docs } = await payload.find({
        collection: 'tenants',
        where: {
          organization: organizationFilter,
        },
        limit: 500,
      })

      return docs
    }),

  create: privateProcedure
    .input(TenantValidator)
    .mutation(async ({ input }) => {
      const payload = await getPayloadClient()

      const created = await payload.create({
        collection: 'tenants',
        data: {
          organization: input.organizationId,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          notes: input.notes,
        },
      })

      return created
    }),
})