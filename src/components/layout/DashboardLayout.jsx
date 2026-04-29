import { FileText, LayoutDashboard, LogOut, Settings } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { to: '/reports', label: 'البلاغات', icon: FileText },
  { to: '/daily-work', label: 'توثيق أعمال المقاولين', icon: FileText },
]

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800" dir="rtl">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="flex flex-col bg-white p-6 shadow-xl ring-1 ring-slate-200">
          <div className="mb-10">
            <h1 className="text-2xl font-extrabold text-blue-600">الراصد</h1>
            <p className="mt-1 text-xs text-slate-500">نظام متابعة البلاغات والمقاولين</p>
          </div>

          <nav className="space-y-2">
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all duration-200 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-100'}`
                }
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}

            <div className="pt-4 mt-4 border-t border-slate-100">
              <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100">
                <Settings size={20} />
                <span>الإعدادات</span>
              </button>

              <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50">
                <LogOut size={20} />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-blue-200" />
              <div className="text-right">
                <p className="text-sm font-bold">محمد ياسر</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Admin / Supervisor</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex flex-col">
          <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 p-4 backdrop-blur-md lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="search"
                  placeholder="بحث سريع..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">متصل الآن</span>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
