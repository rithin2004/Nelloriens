import { useState } from 'react'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'

const allUsers = [
  { id: 1, name: 'Sophie Moore', email: 'sophie@example.com', role: 'Admin', status: 'active', joined: 'Jan 12, 2026', orders: 24 },
  { id: 2, name: 'James Wilson', email: 'james@example.com', role: 'User', status: 'active', joined: 'Feb 3, 2026', orders: 8 },
  { id: 3, name: 'Natasha Lee', email: 'natasha@example.com', role: 'Editor', status: 'inactive', joined: 'Mar 15, 2026', orders: 3 },
  { id: 4, name: 'Carlos Diaz', email: 'carlos@example.com', role: 'User', status: 'active', joined: 'Dec 28, 2025', orders: 17 },
  { id: 5, name: 'Yuki Tanaka', email: 'yuki@example.com', role: 'User', status: 'active', joined: 'Apr 1, 2026', orders: 2 },
  { id: 6, name: 'Priya Sharma', email: 'priya@example.com', role: 'Editor', status: 'active', joined: 'Nov 5, 2025', orders: 11 },
  { id: 7, name: 'Tom Baker', email: 'tom@example.com', role: 'User', status: 'suspended', joined: 'Oct 20, 2025', orders: 0 },
  { id: 8, name: 'Amara Osei', email: 'amara@example.com', role: 'User', status: 'active', joined: 'Mar 30, 2026', orders: 5 },
]

const roleVariant = { Admin: 'primary', Editor: 'info', User: 'default' }
const statusVariant = { active: 'success', inactive: 'warning', suspended: 'danger' }

export default function Users() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [selectedIds, setSelectedIds] = useState([])

  const roles = ['All', 'Admin', 'Editor', 'User']

  const filtered = allUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'All' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    setSelectedIds(prev =>
      prev.length === filtered.length ? [] : filtered.map(u => u.id)
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span>Home</span><span>/</span>
        <span className="text-slate-900 font-medium">Users</span>
      </div>

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">All Users</h2>
          <p className="text-sm text-slate-500">{allUsers.length} total users</p>
        </div>
        <Button
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          Add User
        </Button>
      </div>

      <Card padding={false}>
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1 max-w-sm focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-200 transition-all">
            <svg className="w-4 h-4 text-slate-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none w-full"
            />
          </div>

          {/* Role filter pills */}
          <div className="flex gap-1.5 flex-wrap">
            {roles.map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  roleFilter === role
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk actions */}
        {selectedIds.length > 0 && (
          <div className="px-4 py-2.5 bg-indigo-50 border-b border-indigo-100 flex items-center gap-3">
            <span className="text-sm text-indigo-700 font-medium">{selectedIds.length} selected</span>
            <Button variant="danger" size="xs">Delete</Button>
            <Button variant="secondary" size="xs">Export</Button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">User</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 hidden md:table-cell">Role</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Joined</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Orders</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${selectedIds.includes(user.id) ? 'bg-indigo-50/30' : ''}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(user.id)}
                      onChange={() => toggleSelect(user.id)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge variant={roleVariant[user.role]}>{user.role}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[user.status]} dot>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 hidden lg:table-cell">{user.joined}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 hidden lg:table-cell">{user.orders}</td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-sm">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing {filtered.length} of {allUsers.length} users</p>
          <div className="flex gap-1">
            {[1, 2, 3].map(p => (
              <button
                key={p}
                className={`w-8 h-8 text-sm rounded-lg ${p === 1 ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
