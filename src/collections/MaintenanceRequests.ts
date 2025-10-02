import { Access, CollectionConfig, PayloadRequest } from 'payload/types'

const maintenanceAccessFilter = async (req: PayloadRequest) => {
  const user = req.user
  if (!user) return false
  if (user.role === 'admin') return true

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

export const MaintenanceRequests: CollectionConfig = {
  slug: 'maintenance_requests',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'priority', 'property', 'unit'],
  },
  access: {
    read: async ({ req }) => maintenanceAccessFilter(req),
    create: ({ req }) => !!req.user,
    update: async ({ req }) => maintenanceAccessFilter(req),
    delete: async ({ req }) => maintenanceAccessFilter(req),
  },
  fields: [
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: true,
    },
    {
      name: 'property',
      type: 'relationship',
      relationTo: 'properties',
      required: true,
    },
    {
      name: 'unit',
      type: 'relationship',
      relationTo: 'units',
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'priority',
      type: 'select',
      required: true,
      defaultValue: 'medium',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Emergency', value: 'emergency' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'open',
      options: [
        { label: 'Open', value: 'open' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Resolved', value: 'resolved' },
        { label: 'Closed', value: 'closed' },
      ],
    },
    {
      name: 'attachments',
      label: 'Attachments',
      type: 'array',
      fields: [
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: { hidden: true },
      access: {
        create: () => false,
        read: ({ req }) => req.user?.role === 'admin',
        update: () => false,
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && req.user) {
          data.createdBy = req.user.id
          // If organization not provided, infer from property
          if (!data.organization && data.property) {
            const prop = await req.payload.findByID({
              collection: 'properties',
              id: typeof data.property === 'string' ? data.property : data.property.id,
            })
            if (prop?.organization) {
              data.organization =
                typeof prop.organization === 'string'
                  ? prop.organization
                  : prop.organization.id
            }
          }
        }
        return data
      },
    ],
  },
}