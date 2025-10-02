import { Access, CollectionConfig } from 'payload/types'

const isLoggedIn: Access = ({ req: { user } }) => !!user

const isAdmin: Access = ({ req: { user } }) => user?.role === 'admin'

const isOrgMember = (): Access => async ({ req }) => {
  const user = req.user
  if (!user) return false
  if (user.role === 'admin') return true

  // Limit to orgs where current user is a member
  return {
    'members.user': {
      equals: user.id,
    },
  }
}

const isOrgOwner = (): Access => async ({ req }) => {
  const user = req.user
  if (!user) return false
  if (user.role === 'admin') return true

  return {
    and: [
      { 'members.user': { equals: user.id } },
      { 'members.role': { equals: 'owner' } },
    ],
  }
}

export const Organizations: CollectionConfig = {
  slug: 'organizations',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type'],
  },
  access: {
    read: isOrgMember(),
    create: isLoggedIn,
    update: isOrgOwner(),
    delete: isOrgOwner(),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Landlord', value: 'landlord' },
        { label: 'Property Management Company', value: 'pmc' },
        { label: 'Enterprise', value: 'enterprise' },
      ],
    },
    {
      name: 'members',
      type: 'array',
      required: true,
      minRows: 1,
      labels: {
        singular: 'Member',
        plural: 'Members',
      },
      fields: [
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
        {
          name: 'role',
          type: 'select',
          required: true,
          defaultValue: 'owner',
          options: [
            { label: 'Owner', value: 'owner' },
            { label: 'Manager', value: 'manager' },
            { label: 'Staff', value: 'staff' },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ req, data, operation }) => {
        // Ensure creator is included as owner when creating
        if (operation === 'create' && req.user) {
          const members = Array.isArray(data.members) ? data.members : []
          const alreadyIncluded = members.some((m: any) => {
            if (!m) return false
            if (typeof m.user === 'string') return m.user === req.user!.id
            return m.user?.id === req.user!.id
          })

          if (!alreadyIncluded) {
            return {
              ...data,
              members: [
                ...(members || []),
                { user: req.user.id, role: 'owner' },
              ],
            }
          }
        }
        return data
      },
    ],
  },
}