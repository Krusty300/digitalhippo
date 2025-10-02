import { getPayloadClient } from '@/get-payload'
import { MaintenanceValidator } from '@/lib/validators/maintenance'
import { privateProcedure, router } from './trpc'
import { z } from 'zod'

export const maintenanceRouter = router({
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
        collection: 'maintenance_requests',
        where: {
          organization: organizationFilter,
        },
        depth: 2,
        limit: 500,
      })

      return docs
    }),

  create: privateProcedure
    .input(MaintenanceValidator)
    .mutation(async ({ input, ctx }) => {
      const payload = await getPayloadClient()
      const {
        req: { user },
      } = ctx as any

      const created = await payload.create({
        collection: 'maintenance_requests',
        data: {
          organization: input.organizationId,
          property: input.propertyId,
          unit: input.unitId,
          tenant: input.tenantId,
          title: input.title,
          description: input.description,
          priority: input.priority,
          status: 'open',
          createdBy: user.id,
        },
      })

      return created
    }),

  updateStatus: privateProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
      })
    )
    .mutation(async ({ input }) => {
      const payload = await getPayloadClient()
      const updated = await payload.update({
        collection: 'maintenance_requests',
        id: input.id,
        data: {
          status: input.status,
        },
      })
      return updated
    }),
})