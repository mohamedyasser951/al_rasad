import { FileText, LayoutDashboard, LogOut, Menu, Settings, X, Building2, Users } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

const links = [
  { to: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { to: '/reports', label: 'البلاغات', icon: FileText },
  { to: '/daily-work', label: 'توثيق الأعمال اليوميه', icon: FileText },
  { to: '/contractors', label: 'المقاولين', icon: Building2 },
  { to: '/users', label: 'المستخدمين', icon: Users, adminOnly: true },
]

export default function DashboardLayout() {
  const [isOpen, setIsOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    setShowLogoutConfirm(false)
    await logout()
    navigate('/login', { replace: true })
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white p-6">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-600">الراصد</h1>
          <p className="mt-1 text-xs text-slate-500">نظام متابعه البلاغات والأعمال اليوميه</p>
        </div>
        <button className="lg:hidden" onClick={() => setIsOpen(false)}>
          <X className="text-slate-500" />
        </button>
      </div>

      <nav className="space-y-2 flex-1">
        {links
          .filter((item) => !item.adminOnly || user?.role === 'admin')
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
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

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
          >
            <LogOut size={20} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-blue-200" />
          <div className="text-right">
            <p className="text-sm font-bold">{user?.full_name || user?.username || 'مستخدم'}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{user?.role_display || 'User'}</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800" dir="rtl">
      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between bg-white p-4 border-b border-slate-100 sticky top-0 z-20">
        <h1 className="text-xl font-extrabold text-blue-600">الراصد</h1>
        <button onClick={() => setIsOpen(true)} className="p-2 bg-slate-50 rounded-lg">
          <Menu size={24} className="text-slate-600" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col bg-white shadow-xl ring-1 ring-slate-200 sticky top-0 h-screen">
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar (Drawer) */}
        <aside className={`fixed inset-y-0 right-0 w-72 bg-white z-40 lg:hidden transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full'}`}>
          <SidebarContent />
        </aside>

        <div className="flex flex-col min-w-0">
          <main className="flex-1 p-4 lg:p-8 animate-fade-in">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-rose-50 p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <LogOut size={32} />
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">تسجيل الخروج</h3>
              <p className="text-sm text-slate-600">هل أنت متأكد أنك تريد تسجيل الخروج من النظام؟</p>
            </div>
            <div className="flex gap-3 bg-slate-50 p-6">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-rose-200 hover:bg-rose-700 transition-colors"
              >
                نعم، خروج
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
