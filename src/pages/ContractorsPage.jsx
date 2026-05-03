import { Building2, Plus, Search, MoreVertical, Edit2, Trash2, User, Phone, Mail, FileCheck } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import { contractorService, userService } from '../api/services'
import { EmptyState, ErrorState, LoadingState } from '../components/common/States'
import { fetchContractors } from '../api/endpoints'
import useApiList from '../hooks/useApiList'
import useDebounce from '../hooks/useDebounce'

export default function ContractorsPage() {
  const [filters, setFilters] = useState({ search: '', manager_id: '' })
  const [selectedContractor, setSelectedContractor] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [viewingProfile, setViewingProfile] = useState(null)
  const [managers, setManagers] = useState([])

  useEffect(() => {
    userService.list({ role: 'manager' }).then(res => setManagers(res.data?.results || []))
  }, [])

  const debouncedSearch = useDebounce(filters.search, 500)

  const params = useMemo(() => ({
    search: debouncedSearch,
    user_id: filters.manager_id,
    page_size: 50
  }), [debouncedSearch, filters.manager_id])

  const { data: contractors, loading, error, refresh } = useApiList(fetchContractors, params)

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المقاول؟')) {
      try {
        await contractorService.delete(id)
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
          <h1 className="text-2xl font-bold text-slate-900">المقاولون</h1>
          <p className="text-sm text-slate-500">إدارة شركات المقاولات المسجلة في النظام</p>
        </div>
        <button
          onClick={() => { setSelectedContractor(null); setShowForm(true); }}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-md shadow-blue-100"
        >
          <Plus size={18} />
          <span>إضافة مقاول جديد</span>
        </button>
      </header>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              className="input pl-11 w-full"
              placeholder="بحث باسم المقاول..."
              value={filters.search}
              onChange={(e) => setFilters(p => ({ ...p, search: e.target.value }))}
            />
          </div>
          <select
            className="input"
            value={filters.manager_id}
            onChange={(e) => setFilters(p => ({ ...p, manager_id: e.target.value }))}
          >
            <option value="">جميع المشرفين</option>
            {managers.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loading && <LoadingState lines={5} />}
        {error && <ErrorState message="تعذر تحميل بيانات المقاولين." />}
        {!loading && !error && contractors.length === 0 && <EmptyState message="لا يوجد مقاولين حالياً." />}

        {contractors.map((contractor) => (
          <article key={contractor.id} className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-xl hover:ring-blue-500 animate-fade-up">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <Building2 size={24} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setSelectedContractor(contractor); setShowForm(true); }} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(contractor.id)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <h3
              className="mb-2 cursor-pointer text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors"
              onClick={() => setViewingProfile(contractor)}
            >
              {contractor.name}
            </h3>

            <div className="mb-6 space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <User size={14} className="text-blue-500" />
                <span>المشرف: {contractor.responsible_user?.name || 'غير محدد'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Phone size={14} className="text-blue-500" />
                <span>{contractor.phone || 'غير مسجل'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-xs text-slate-400">البلاغات</p>
                  <p className="font-bold text-slate-900">{contractor.reports_count}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400">الأعمال</p>
                  <p className="font-bold text-slate-900">{contractor.daily_work_count}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingProfile(contractor)}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                عرض الملف الكامل
              </button>
            </div>
          </article>
        ))}
      </div>

      {showForm && (
        <ContractorForm
          contractor={selectedContractor}
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); refresh(); }}
        />
      )}

      {viewingProfile && (
        <ContractorProfile
          contractorId={viewingProfile.id}
          onClose={() => setViewingProfile(null)}
        />
      )}
    </div>
  )
}

function ContractorForm({ contractor, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: contractor?.name || '',
    phone: contractor?.phone || '',
    email: contractor?.email || '',
    user_id: contractor?.responsible_user?.id || '',
    is_active: contractor?.is_active ?? true
  })
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    let mounted = true
    userService.list({ role: 'manager' })
      .then(res => {
        if (mounted) setUsers(res.data?.results || [])
      })
      .catch(err => console.error('Failed to load managers:', err))
      .finally(() => {
        if (mounted) setLoadingUsers(false)
      })
    return () => { mounted = false }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setErrors({})
    try {
      if (contractor) {
        await contractorService.partialUpdate(contractor.id, formData)
      } else {
        await contractorService.create(formData)
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
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">
          {contractor ? 'تعديل بيانات المقاول' : 'إضافة مقاول جديد'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">اسم الشركة *</label>
            <input
              required
              className="input w-full"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name[0]}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">المسؤول (المشرف) *</label>
            <select
              required
              className="input w-full"
              value={formData.user_id}
              onChange={e => setFormData({ ...formData, user_id: e.target.value })}
              disabled={loadingUsers}
            >
              <option value="">اختر مشرفاً...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            {loadingUsers && <p className="text-[10px] text-blue-600 animate-pulse">جاري تحميل المشرفين...</p>}
            {errors.user_id && <p className="text-xs text-red-500 mt-1">{errors.user_id[0]}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">رقم الهاتف</label>
              <input
                className="input w-full"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone[0]}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">البريد الإلكتروني</label>
              <input
                type="email"
                className="input w-full"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button type="button" onClick={onClose} className="rounded-xl px-6 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50">إلغاء</button>
            <button
              type="submit"
              disabled={submitting || loadingUsers}
              className="rounded-xl bg-blue-600 px-8 py-2 text-sm font-bold text-white shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'جاري الحفظ...' : 'حفظ البيانات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ContractorProfile({ contractorId, onClose }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    contractorService.profile(contractorId)
      .then(res => setProfile(res.data))
      .catch(() => alert('فشل تحميل الملف الشخصي'))
      .finally(() => setLoading(false))
  }, [contractorId])

  if (loading) return null // Could use a small loader

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-blue-600 p-4 text-white shadow-lg shadow-blue-200">
              <Building2 size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{profile?.name}</h2>
              <p className="text-sm text-slate-500">المشرف: {profile?.responsible_user?.name || 'غير محدد'}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200">
            <Plus size={24} className="rotate-45" />
          </button>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-r-4 border-blue-600 pr-3">معلومات التواصل</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-600">
                <User size={18} className="text-blue-500" />
                <span>{profile?.contact_person || 'غير محدد'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Phone size={18} className="text-blue-500" />
                <span>{profile?.phone || 'غير محدد'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Mail size={18} className="text-blue-500" />
                <span>{profile?.email || 'غير محدد'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-r-4 border-blue-600 pr-3">الإحصائيات</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-50 p-4 text-center">
                <p className="text-2xl font-black text-blue-600">{profile?.reports_count}</p>
                <p className="text-xs font-bold text-slate-500">إجمالي البلاغات</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 text-center">
                <p className="text-2xl font-black text-blue-600">{profile?.daily_work_count}</p>
                <p className="text-xs font-bold text-slate-500">الأعمال اليومية</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
