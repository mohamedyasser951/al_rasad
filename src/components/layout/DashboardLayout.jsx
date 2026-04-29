import { Bell, ClipboardList, FileText, HardHat, LayoutDashboard, Moon, Sun } from 'lucide-react'
import { useMemo, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { mockAlerts } from '../../data/mockData'

const links = [
  { to: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { to: '/reports', label: 'البلاغات', icon: FileText },
  { to: '/daily-work', label: 'توثيق أعمال المقاولين', icon: ClipboardList },
]

export default function DashboardLayout() {
  const [dark, setDark] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const themeClass = useMemo(() => (dark ? 'dark' : ''), [dark])

  return (
    <div className={`${themeClass} min-h-screen bg-slate-100 text-slate-800`} dir="rtl">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="bg-slate-900 p-6 text-slate-100">
          <h1 className="text-2xl font-extrabold">الراصد</h1>
          <p className="mt-2 text-sm text-slate-300">نظام متابعة البلاغات والمقاولين</p>
          <nav className="mt-8 space-y-2">
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2 transition ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-800 p-4">
            <p className="text-xs text-slate-300">الأدوار</p>
            <p className="mt-1 font-semibold">Admin / Supervisor</p>
          </div>
        </aside>

        <div className="p-4 lg:p-6">
          <header className="mb-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <input
                type="search"
                placeholder="بحث برقم البلاغ أو الموقع أو المقاول"
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 lg:max-w-md"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDark((prev) => !prev)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                >
                  {dark ? <Sun size={16} className="inline" /> : <Moon size={16} className="inline" />} الوضع
                </button>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowNotifications((prev) => !prev)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    <Bell size={16} className="inline" /> التنبيهات
                  </button>
                  {showNotifications && (
                    <div className="absolute left-0 z-20 mt-2 w-80 space-y-2 rounded-xl bg-white p-3 shadow-lg ring-1 ring-slate-200">
                      {mockAlerts.map((alert) => (
                        <p key={alert.id} className="rounded-lg bg-slate-50 px-2 py-2 text-sm text-slate-700">
                          {alert.text}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
