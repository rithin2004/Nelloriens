import { useState } from 'react'
import Sidebar from './Sidebar'
import MobileSidebar from './MobileSidebar'
import Header from './Header'

export default function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#eef3fd' }}>
      <Sidebar />
      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ background: '#eef3fd' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
