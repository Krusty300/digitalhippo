import { Access, CollectionConfig, PayloadRequest } from 'payload/types'

const tenantAccessFilter = async (req: PayloadRequest) => {
  const user = req.user
  if (!user) return false
  if (user.role === 'admin') return true

  // orgs for member
  const orgs = await req.payload.find({
    collection: 'organizations',
    where: { 'members.user': { equals: user.id } },
    limit: 100,
  })
  const orgIds = orgs.docs.map((o) => o.id as string)
  if (orgIds.length === 0) return { id: { equals: '___none___' } }

  return {
    organization: {
      in: orgIds,
    },
  }
}

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['firstName', 'lastName', 'email', 'organization'],
  },
  access: {
    read: async ({ req }) => tenantAccessFilter(req),
    create: ({ req }) => !!req.user,
    update: async ({ req }) => tenantAccessFilter(req),
    delete: async ({ req }) => tenantAccessFilter(req),
  },
  fields: [
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: true,
    },
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'user',
      label: 'Linked User (optional)',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
}