import { Access, CollectionConfig, PayloadRequest } from 'payload/types'

const isLoggedIn: Access = ({ req: { user } }) => !!user

const isOrgMemberFilter = async (req: PayloadRequest) => {
  const user = req.user
  if (!user) return false
  if (user.role === 'admin') return true

  // Find organizations where user is a member
  const orgs = await req.payload.find({
    collection: 'organizations',
    where: {
      'members.user': {
        equals: user.id,
      },
    },
    limit: 100,
  })

  const orgIds = orgs.docs.map((o) =>
    typeof o.id === 'string' ? o.id : o.id?.toString()
  )

  if (orgIds.length === 0) return { id: { equals: '___none___' } }

  return {
    organization: {
      in: orgIds,
    },
  }
}

export const Properties: CollectionConfig = {
  slug: 'properties',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'city', 'state', 'organization'],
  },
  access: {
    read: async ({ req }) => isOrgMemberFilter(req),
    create: isLoggedIn,
    update: async ({ req }) => isOrgMemberFilter(req),
    delete: async ({ req }) => isOrgMemberFilter(req),
  },
  fields: [
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: true,
    },
    {
      name: 'name',
      label: 'Property Name',
      type: 'text',
      required: true,
    },
    {
      name: 'type',
      label: 'Property Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Residential', value: 'residential' },
        { label: 'Commercial', value: 'commercial' },
        { label: 'Mixed Use', value: 'mixed' },
      ],
    },
    {
      name: 'address1',
      label: 'Address Line 1',
      type: 'text',
      required: true,
    },
    {
      name: 'address2',
      label: 'Address Line 2',
      type: 'text',
    },
    {
      name: 'city',
      type: 'text',
      required: true,
    },
    {
      name: 'state',
      type: 'text',
      required: true,
    },
    {
      name: 'postalCode',
      label: 'Postal / ZIP',
      type: 'text',
      required: true,
    },
    {
      name: 'country',
      type: 'text',
      required: true,
      defaultValue: 'USA',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'images',
      type: 'array',
      label: 'Property images',
      maxRows: 8,
      fields: [
        {
          name: 'image',
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
        if (operation === 'create') {
          // attach creator
          if (req.user) {
            data.createdBy = req.user.id
          }

          // Ensure organization exists if not provided: create a personal org
          if (!data.organization && req.user) {
            const email = req.user.email || 'user'
            const name = `Personal - ${email}`

            // Try to find existing
            const existing = await req.payload.find({
              collection: 'organizations',
              where: {
                and: [
                  { name: { equals: name } },
                  { 'members.user': { equals: req.user.id } },
                ],
              },
              limit: 1,
            })

            let orgId: string

            if (existing.docs.length > 0) {
              orgId = existing.docs[0].id as string
            } else {
              const created = await req.payload.create({
                collection: 'organizations',
                data: {
                  name,
                  type: 'landlord',
                  members: [{ user: req.user.id, role: 'owner' }],
                },
              })
              orgId = created.id as string
            }

            data.organization = orgId
          }
        }

        return data
      },
    ],
  },
}