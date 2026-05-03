import { Users, Plus, Search, Edit2, Trash2, Shield, Key, Mail, User as UserIcon, CheckCircle2, XCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { userService, contractorService } from '../api/services'
import { EmptyState, ErrorState, LoadingState } from '../components/common/States'
import { fetchUsers } from '../api/endpoints'
import useApiList from '../hooks/useApiList'
import useDebounce from '../hooks/useDebounce'

export default function UsersPage() {
  const [filters, setFilters] = useState({ search: '', role: 'manager' })
  const [selectedUser, setSelectedUser] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(null)

  const debouncedSearch = useDebounce(filters.search, 500)

  const params = useMemo(() => ({
    search: debouncedSearch,
    role: filters.role,
    page_size: 50
  }), [debouncedSearch, filters.role])

  const { data: users, loading, error, refresh } = useApiList(fetchUsers, params)

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      try {
        await userService.delete(id)
        refresh()
      } catch (err) {
        alert('فشل الحذف')
      }
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إدارة المستخدمين</h1>
          <p className="text-sm text-slate-500">إدارة صلاحيات وحسابات موظفي النظام</p>
        </div>
        <button 
          onClick={() => { setSelectedUser(null); setShowForm(true); }}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-md shadow-blue-100"
        >
          <Plus size={18} />
          <span>إضافة مستخدم جديد</span>
        </button>
      </header>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              className="input pl-11 w-full" 
              placeholder="بحث بالاسم أو البريد..." 
              value={filters.search} 
              onChange={(e) => setFilters(p => ({ ...p, search: e.target.value }))} 
            />
          </div>
          <select 
            className="input" 
            value={filters.role} 
            onChange={(e) => setFilters(p => ({ ...p, role: e.target.value }))}
          >
            <option value="">جميع الأدوار</option>
            <option value="admin">مدير النظام</option>
            <option value="manager">مدير مقاولين</option>
            <option value="supervisor">مشرف ميداني</option>
          </select>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loading && <LoadingState lines={5} />}
        {error && <ErrorState message="تعذر تحميل بيانات المستخدمين." />}
        {!loading && !error && users.length === 0 && <EmptyState message="لا يوجد مستخدمين حالياً." />}
        
        {users.map((user) => (
          <article key={user.id} className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-xl hover:ring-blue-500 animate-fade-up">
            <div className="mb-4 flex items-start justify-between">
              <div className={`rounded-2xl p-3 shadow-sm ${user.role === 'admin' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'}`}>
                <Shield size={24} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowPasswordModal(user)} title="تعيين كلمة المرور" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-amber-600 transition-colors">
                  <Key size={16} />
                </button>
                <button onClick={() => { setSelectedUser(user); setShowForm(true); }} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(user.id)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900">{user.name}</h3>
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-widest">
                <span>{user.role_display}</span>
                {user.is_active ? <CheckCircle2 size={12} className="text-green-500" /> : <XCircle size={12} className="text-rose-500" />}
              </div>
            </div>
            
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Mail size={14} />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="text-[10px] text-slate-400">
                تم الإنشاء في: {new Date(user.created_at).toLocaleDateString('ar-SA')}
              </div>
            </div>
          </article>
        ))}
      </div>

      {showForm && (
        <UserForm 
          user={selectedUser} 
          onClose={() => setShowForm(false)} 
          onSuccess={() => { setShowForm(false); refresh(); }} 
        />
      )}

      {showPasswordModal && (
        <PasswordResetModal 
          user={showPasswordModal} 
          onClose={() => setShowPasswordModal(null)} 
        />
      )}
    </div>
  )
}

function UserForm({ user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'manager',
    is_active: user?.is_active ?? true,
    contractor_id: user?.contractor?.id || ''
  })
  const [contractors, setContractors] = useState([])
  const [loadingContractors, setLoadingContractors] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (formData.role === 'supervisor') {
      setLoadingContractors(true)
      // Only fetch contractors that are active and optionally unassigned
      contractorService.list({ is_active: true, page_size: 100 })
        .then(res => {
          const allContractors = res.data?.results || []
          // If we are in edit mode, we want to keep the current contractor in the list
          setContractors(allContractors)
        })
        .catch(err => console.error('Failed to load contractors:', err))
        .finally(() => setLoadingContractors(false))
    } else {
      setFormData(prev => ({ ...prev, contractor_id: '' }))
    }
  }, [formData.role])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return

    // Client-side validation for supervisor
    if (formData.role === 'supervisor' && !formData.contractor_id) {
      setErrors({ contractor_id: ['يرجى اختيار المقاول لهذا المشرف'] })
      return
    }

    setSubmitting(true)
    setErrors({})
    
    // Prepare data
    const payload = {
      name: formData.name,
      role: formData.role,
      is_active: formData.is_active,
      contractor_id: formData.role === 'supervisor' ? formData.contractor_id : null
    }

    try {
      if (user) {
        await userService.partialUpdate(user.id, payload)
      } else {
        await userService.create({ ...payload, email: formData.email, password: formData.password })
      }
      onSuccess()
    } catch (err) {
      setErrors(err.response?.data || { detail: 'حدث خطأ أثناء الحفظ' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200 text-right" dir="rtl">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">
          {user ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">الاسم الكامل *</label>
            <input 
              required
              className="input w-full" 
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })} 
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name[0]}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">البريد الإلكتروني *</label>
            <input 
              required
              type="email"
              disabled={!!user}
              className="input w-full disabled:bg-slate-50" 
              value={formData.email} 
              onChange={e => setFormData({ ...formData, email: e.target.value })} 
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>}
          </div>
          {!user && (
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">كلمة المرور *</label>
              <input 
                required
                type="password"
                className="input w-full" 
                value={formData.password} 
                onChange={e => setFormData({ ...formData, password: e.target.value })} 
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password[0]}</p>}
            </div>
          )}
          
          <div className="grid gap-4 grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">الدور</label>
              <select 
                className="input w-full" 
                value={formData.role} 
                onChange={e => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="admin">مدير نظام</option>
                <option value="manager">مدير مقاولين</option>
                <option value="supervisor">مشرف ميداني</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">الحالة</label>
              <select 
                className="input w-full" 
                value={formData.is_active ? 'true' : 'false'} 
                onChange={e => setFormData({ ...formData, is_active: e.target.value === 'true' })}
              >
                <option value="true">نشط</option>
                <option value="false">معطل</option>
              </select>
            </div>
          </div>

          {formData.role === 'supervisor' && (
            <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
              <label className="text-sm font-semibold text-slate-700">المقاول التابع له *</label>
              <select 
                required
                className="input w-full" 
                value={formData.contractor_id} 
                onChange={e => setFormData({ ...formData, contractor_id: e.target.value })}
                disabled={loadingContractors}
              >
                <option value="">اختر المقاول...</option>
                {contractors.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {loadingContractors && <p className="text-[10px] text-blue-600 animate-pulse">جاري تحميل المقاولين...</p>}
              {errors.contractor_id && <p className="text-xs text-red-500 mt-1">{errors.contractor_id[0]}</p>}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6">
            <button type="button" onClick={onClose} className="rounded-xl px-6 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50">إلغاء</button>
            <button 
              type="submit" 
              disabled={submitting || (formData.role === 'supervisor' && loadingContractors)}
              className="rounded-xl bg-blue-600 px-8 py-2 text-sm font-bold text-white shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
          {errors.detail && <p className="text-sm text-red-500 text-center">{errors.detail}</p>}
        </form>
      </div>
    </div>
  )
}

function PasswordResetModal({ user, onClose }) {
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await userService.setPassword(user.id, { 
        email: user.email, 
        name: user.name, 
        password 
      })
      alert('تم تغيير كلمة المرور بنجاح')
      onClose()
    } catch (err) {
      alert('فشل تغيير كلمة المرور')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        <h2 className="mb-2 text-xl font-bold text-slate-900">تعيين كلمة مرور جديدة</h2>
        <p className="mb-6 text-sm text-slate-500">للمستخدم: {user.name}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">كلمة المرور الجديدة</label>
            <input 
              required
              type="password"
              className="input w-full" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="rounded-xl px-6 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50">إلغاء</button>
            <button 
              type="submit" 
              disabled={submitting}
              className="rounded-xl bg-amber-600 px-8 py-2 text-sm font-bold text-white shadow-lg shadow-amber-100 hover:bg-amber-700 disabled:opacity-50"
            >
              تحديث كلمة المرور
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
