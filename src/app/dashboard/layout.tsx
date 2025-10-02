import Link from 'next/link'
import { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[70vh]">
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Property Management Dashboard</h1>
          <nav className="flex gap-4">
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
              Overview
            </Link>
            <Link href="/dashboard/properties" className="text-sm text-gray-600 hover:text-gray-900">
              Properties
            </Link>
            <Link href="/dashboard/tenants" className="text-sm text-gray-600 hover:text-gray-900">
              Tenants
            </Link>
            <Link href="/dashboard/maintenance" className="text-sm text-gray-600 hover:text-gray-900">
              Maintenance
            </Link>
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
    </div>
  )
}