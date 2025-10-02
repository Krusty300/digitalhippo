import { Access, CollectionConfig, PayloadRequest } from 'payload/types'

const isMemberByProperty = async (req: PayloadRequest) => {
  const user = req.user
  if (!user) return false
  if (user.role === 'admin') return true

  // Find organizations where the user is a member
  const orgs = await req.payload.find({
    collection: 'organizations',
    where: { 'members.user': { equals: user.id } },
    limit: 100,
  })
  const orgIds = orgs.docs.map((o) => o.id as string)
  if (orgIds.length === 0) return { id: { equals: '___none___' } }

  // Find properties under those orgs
  const props = await req.payload.find({
    collection: 'properties',
    where: { organization: { in: orgIds } },
    limit: 1000,
  })
  const propIds = props.docs.map((p) => p.id as string)
  if (propIds.length === 0) return { id: { equals: '___none___' } }

  return {
    property: {
      in: propIds,
    },
  }
}

export const Units: CollectionConfig = {
  slug: 'units',
  admin: {
    useAsTitle: 'unitNumber',
    defaultColumns: ['unitNumber', 'status', 'rent', 'property'],
  },
  access: {
    read: async ({ req }) => isMemberByProperty(req),
    create: ({ req }) => !!req.user,
    update: async ({ req }) => isMemberByProperty(req),
    delete: async ({ req }) => isMemberByProperty(req),
  },
  fields: [
    {
      name: 'property',
      type: 'relationship',
      relationTo: 'properties',
      required: true,
    },
    {
      name: 'unitNumber',
      label: 'Unit',
      type: 'text',
      required: true,
    },
    {
      name: 'bedrooms',
      type: 'number',
      min: 0,
      max: 20,
      required: true,
      defaultValue: 1,
    },
    {
      name: 'bathrooms',
      type: 'number',
      min: 0,
      max: 20,
      required: true,
      defaultValue: 1,
    },
    {
      name: 'rent',
      label: 'Monthly Rent (USD)',
      type: 'number',
      min: 0,
      max: 1000000,
      required: true,
    },
    {
      name: 'squareFeet',
      type: 'number',
      label: 'Square Feet',
      min: 0,
      max: 1000000,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'vacant',
      options: [
        { label: 'Vacant', value: 'vacant' },
        { label: 'Occupied', value: 'occupied' },
        { label: 'Maintenance', value: 'maintenance' },
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
        }
        return data
      },
    ],
  },
}