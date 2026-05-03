import { AlertCircle, ArrowRight, Building2, Save, User, History, ClipboardList, Calendar, MapPin, Truck, Users } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import { dailyWorkService, contractorService } from '../api/services'
import { fetchDailyWork } from '../api/endpoints'
import { useAuth } from '../auth/AuthContext'
import useApiList from '../hooks/useApiList'
import { EmptyState, ErrorState, LoadingState } from '../components/common/States'
import LocationPicker from '../components/common/LocationPicker'
import UploadArea from '../components/common/UploadArea'

function AdminOnly({ children }) {
  const { user } = useAuth()
  if (user?.role !== 'admin') return null
  return <>{children}</>
}

export default function DailyWorkPage() {
  const [activeTab, setActiveTab] = useState('new') // 'new' or 'history'
  const [contractors, setContractors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedContractor, setSelectedContractor] = useState(null)

  useEffect(() => {
    contractorService
      .list({ is_active: true, page_size: 100 })
      .then((response) => {
        setContractors(response.data?.results || [])
      })
      .catch((err) => console.error('Failed to load contractors:', err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 pb-10 animate-fade-in">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">توثيق الأعمال اليوميه</h1>
          <p className="text-sm text-slate-500">نظام متابعة وإدارة الإنجاز اليومي للميدان</p>
        </div>
        
        <div className="flex rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200">
          <button 
            onClick={() => { setActiveTab('new'); setSelectedContractor(null); }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${activeTab === 'new' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <ClipboardList size={18} />
            <span>توثيق جديد</span>
          </button>
          <button 
            onClick={() => { setActiveTab('history'); setSelectedContractor(null); }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <History size={18} />
            <span>سجل الأعمال</span>
          </button>
        </div>
      </header>

      <div className="space-y-6">
        {selectedContractor && (
          <div className="flex items-center justify-between animate-fade-in">
            <p className="text-sm font-medium text-slate-600">
              {activeTab === 'new' ? 'توثيق الإنجاز لـ: ' : 'سجل الأعمال لـ: '}
              <span className="font-bold text-blue-600">{selectedContractor.name}</span>
            </p>
            <button 
              onClick={() => setSelectedContractor(null)}
              className="flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-600"
            >
              <ArrowRight size={18} />
              تغيير الشركة
            </button>
          </div>
        )}

        {loading ? (
          <LoadingState lines={5} />
        ) : !selectedContractor ? (
          contractors.length === 0 ? (
            <EmptyState message="لا يوجد مقاولين مسجلين حالياً." />
          ) : (
            <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {contractors.map((contractor) => (
                <button
                  key={contractor.id}
                  onClick={() => setSelectedContractor(contractor)}
                  className="group relative flex flex-col items-center justify-center gap-4 rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-xl hover:ring-blue-500 animate-fade-up"
                >
                  <div className="rounded-2xl p-4 transition-colors bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white">
                    <Building2 size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">{contractor.name}</h3>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    {activeTab === 'new' ? 'بدء التوثيق' : 'عرض السجل'}
                  </div>
                </button>
              ))}
            </section>
          )
        ) : activeTab === 'new' ? (
          <div className="mx-auto max-w-3xl">
            <DailyWorkForm contractor={selectedContractor} onSuccess={() => setSelectedContractor(null)} />
          </div>
        ) : (
          <DailyWorkHistory contractor={selectedContractor} />
        )}
      </div>
    </div>
  )
}

function DailyWorkHistory({ contractor }) {
  const params = useMemo(() => ({ page_size: 50, ordering: '-created_at', contractor_id: contractor?.id }), [contractor?.id])
  const { data: history, loading, error, refresh } = useApiList(fetchDailyWork, params)

  const handleStatusChange = async (id, status) => {
    try {
      await dailyWorkService.changeStatus(id, { status })
      refresh()
    } catch (err) {
      alert('فشل تغيير الحالة')
    }
  }

  if (loading) return <LoadingState lines={8} />
  if (error) return <ErrorState message="تعذر تحميل سجل الأعمال." />
  if (!history.length) return <EmptyState message="لا يوجد سجل أعمال حالياً." />

  return (
    <div className="grid gap-6">
      {history.map((item) => (
        <article key={item.id} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md animate-fade-up">
          <div className="flex flex-col md:flex-row">
            {/* Before/After Images side-by-side on the left for desktop, top for mobile */}
            <div className="flex aspect-video w-full shrink-0 gap-1 bg-slate-100 md:w-72 lg:w-96">
              <div className="relative flex-1 group">
                <img src={item.before_image_url} alt="قبل" className="h-full w-full object-cover" />
                <div className="absolute bottom-2 inset-x-2 rounded-lg bg-black/40 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">قبل</div>
              </div>
              <div className="relative flex-1 group">
                <img src={item.after_image_url} alt="بعد" className="h-full w-full object-cover" />
                <div className="absolute bottom-2 inset-x-2 rounded-lg bg-blue-600/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">بعد</div>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 uppercase tracking-wider">{item.contractor?.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      item.status === 'completed' ? 'bg-green-50 text-green-600' :
                      item.status === 'rejected' ? 'bg-red-50 text-red-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {item.status_display}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{item.activity}</h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                  <Calendar size={14} />
                  <span>{new Date(item.created_at).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>

              {/* Status Change Buttons for Admin */}
              <AdminOnly>
                <div className="mb-4 flex gap-2">
                  <button 
                    onClick={() => handleStatusChange(item.id, 'completed')}
                    className="rounded-lg bg-green-600 px-3 py-1 text-xs font-bold text-white hover:bg-green-700"
                  >
                    اعتماد
                  </button>
                  <button 
                    onClick={() => handleStatusChange(item.id, 'rejected')}
                    className="rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-700"
                  >
                    رفض
                  </button>
                </div>
              </AdminOnly>

              <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
                  <div className="rounded-lg bg-white p-1.5 text-blue-600 shadow-sm"><User size={14} /></div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500">المشرف</p>
                    <p className="truncate text-xs font-bold">{item.supervisor_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
                  <div className="rounded-lg bg-white p-1.5 text-blue-600 shadow-sm"><MapPin size={14} /></div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500">الموقع</p>
                    <p className="truncate text-xs font-bold">{item.location_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
                  <div className="rounded-lg bg-white p-1.5 text-blue-600 shadow-sm"><Users size={14} /></div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500">العمال</p>
                    <p className="text-xs font-bold">{item.workers_count}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
                  <div className="rounded-lg bg-white p-1.5 text-blue-600 shadow-sm"><Truck size={14} /></div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500">الآلات</p>
                    <p className="text-xs font-bold">{item.machines_count}</p>
                  </div>
                </div>
              </div>

              {item.notes && (
                <div className="mt-auto border-t border-slate-100 pt-4">
                  <p className="text-sm leading-relaxed text-slate-600 line-clamp-2">{item.notes}</p>
                </div>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

function DailyWorkForm({ contractor, onSuccess }) {
  const [formData, setFormData] = useState({
    supervisor_name: '',
    workers_count: '',
    machines_count: '',
    activity: '',
    notes: '',
    location_name: '',
    latitude: '',
    longitude: '',
    status: 'pending',
    before_image: null,
    after_image: null
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.supervisor_name || !formData.workers_count || !formData.machines_count || !formData.activity) {
      setError('يرجى إكمال جميع حقول التوثيق المطلوبة')
      return
    }

    if (!formData.latitude || !formData.longitude) {
      setError('يرجى تحديد موقع الإنجاز (GPS)')
      return
    }

    setSubmitting(true)
    try {
      const submitData = new FormData()
      submitData.append('contractor_id', contractor.id)
      submitData.append('supervisor_name', formData.supervisor_name)
      submitData.append('workers_count', formData.workers_count)
      submitData.append('machines_count', formData.machines_count)
      submitData.append('activity', formData.activity)
      submitData.append('location_name', formData.location_name)
      submitData.append('status', formData.status)
      if (formData.latitude) submitData.append('latitude', formData.latitude)
      if (formData.longitude) submitData.append('longitude', formData.longitude)
      if (formData.notes) submitData.append('notes', formData.notes)
      if (formData.before_image) submitData.append('before_image', formData.before_image)
      if (formData.after_image) submitData.append('after_image', formData.after_image)

      await dailyWorkService.create(submitData)
      alert(`تم حفظ توثيق ${contractor.name} بنجاح`)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'فشل حفظ التوثيق')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <article className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center gap-4 border-b border-slate-100 pb-6">
        <div className="rounded-xl p-3 bg-blue-50 text-blue-600">
          <Building2 size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">{contractor.name}</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">نموذج التوثيق اليومي</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-3 mb-6 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">اسم المشرف *</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                className="input pl-12 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 transition-all w-full" 
                placeholder="اسم المشرف المسؤول" 
                value={formData.supervisor_name}
                onChange={(e) => setFormData({...formData, supervisor_name: e.target.value})}
                disabled={submitting}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">النشاط *</label>
            <input 
              type="text" 
              className="input py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 transition-all w-full" 
              placeholder="وصف النشاط" 
              value={formData.activity}
              onChange={(e) => setFormData({...formData, activity: e.target.value})}
              disabled={submitting}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">عدد العمال *</label>
            <input 
              type="number" 
              className="input py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 transition-all w-full" 
              placeholder="مثال: 15" 
              min="0"
              value={formData.workers_count}
              onChange={(e) => setFormData({...formData, workers_count: e.target.value})}
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">عدد الآلات *</label>
            <input 
              type="number" 
              className="input py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 transition-all w-full" 
              placeholder="مثال: 3" 
              min="0"
              value={formData.machines_count}
              onChange={(e) => setFormData({...formData, machines_count: e.target.value})}
              disabled={submitting}
            />
          </div>
        </div>



        <LocationPicker 
          onLocationChange={(lat, lng, name) => {
            setFormData({
              ...formData,
              latitude: lat.toString(),
              longitude: lng.toString(),
              location_name: name || formData.location_name
            })
          }}
        />

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">التقرير (ملاحظات)</label>
          <textarea 
            className="input bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 transition-all w-full min-h-[80px]"
            placeholder="اكتب تفاصيل التقرير أو الملاحظات..."
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            disabled={submitting}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <UploadArea 
            id="before" 
            label="صورة قبل العمل" 
            value={formData.before_image}
            onChange={(img) => setFormData({...formData, before_image: img})}
            disabled={submitting}
          />
          <UploadArea 
            id="after" 
            label="صورة بعد العمل" 
            value={formData.after_image}
            onChange={(img) => setFormData({...formData, after_image: img})}
            disabled={submitting}
          />
        </div>

        <button 
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-base font-bold text-white transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] bg-blue-600 hover:bg-blue-700 shadow-blue-200 disabled:opacity-50 disabled:hover:scale-100"
        >
          <Save size={20} />
          <span>{submitting ? 'جاري الإرسال...' : 'إرسال التوثيق اليومي'}</span>
        </button>
      </form>
    </article>
  )
}
