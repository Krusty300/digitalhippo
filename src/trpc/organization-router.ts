import { getPayloadClient } from '@/get-payload'
import { privateProcedure, router } from './trpc'
import { OrganizationValidator } from '@/lib/validators/organization'
import { z } from 'zod'

export const organizationRouter = router({
  listMine: privateProcedure.query(async ({ ctx }) => {
    const payload = await getPayloadClient()

    const {
      req: { user },
    } = ctx as any

    // orgs where user is a member
    const { docs } = await payload.find({
      collection: 'organizations',
      where: {
        'members.user': {
          equals: user.id,
        },
      },
      limit: 100,
    })

    return docs
  }),

  create: privateProcedure
    .input(OrganizationValidator)
    .mutation(async ({ input, ctx }) => {
      const payload = await getPayloadClient()
      const {
        req: { user },
      } = ctx as any

      const created = await payload.create({
        collection: 'organizations',
        data: {
          name: input.name,
          type: input.type,
          members: [{ user: user.id, role: 'owner' }],
        },
      })

      return created
    }),

  addMember: privateProcedure
    .input(
      z.object({
        organizationId: z.string(),
        userId: z.string(),
        role: z.enum(['owner', 'manager', 'staff']).default('staff'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const payload = await getPayloadClient()
      const {
        req: { user },
      } = ctx as any

      // Ensure the acting user is owner/manager of the org
      const org = await payload.findByID({
        collection: 'organizations',
        id: input.organizationId,
      })

      const isAuthorized =
        (org.members || []).some((m: any) => {
          const id = typeof m.user === 'string' ? m.user : m.user?.id
          return id === user.id && (m.role === 'owner' || m.role === 'manager')
        }) || user.role === 'admin'

      if (!isAuthorized) {
        throw new Error('Not authorized')
      }

      const updated = await payload.update({
        collection: 'organizations',
        id: input.organizationId,
        data: {
          members: [
            ...(org.members || []),
            { user: input.userId, role: input.role },
          ],
        },
      })

      return updated
    }),
})