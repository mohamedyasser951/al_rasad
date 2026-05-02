import { AlertCircle, ArrowRight, Building2, Save, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { dailyWorkService, contractorService } from '../api/services'
import LocationPicker from '../components/common/LocationPicker'
import UploadArea from '../components/common/UploadArea'

export default function DailyWorkPage() {
  const [contractors, setContractors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedContractor, setSelectedContractor] = useState(null)

  useEffect(() => {
    contractorService
      .list({ is_active: true, page_size: 100 })
      .then((response) => {
        setContractors(response.data?.results || [])
        if (response.data?.results?.length > 0) {
          setSelectedContractor(response.data.results[0])
        }
      })
      .catch((err) => console.error('Failed to load contractors:', err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8 pb-10 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">توثيق الأعمال اليوميه</h1>
          <p className="text-sm text-slate-500">
            {selectedContractor ? `توثيق الإنجاز اليومي لـ ${selectedContractor.name}` : "اختر الشركة لبدء التوثيق"}
          </p>
        </div>
        {selectedContractor && (
          <button 
            onClick={() => setSelectedContractor(null)}
            className="flex items-center gap-2 text-sm font-bold text-blue-600 transition hover:text-blue-700"
          >
            <ArrowRight size={18} />
            تغيير الشركة
          </button>
        )}
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : !selectedContractor ? (
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
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">بدء التوثيق</div>
            </button>
          ))}
        </section>
      ) : (
        <div className="mx-auto max-w-3xl">
          <DailyWorkForm contractor={selectedContractor} onSuccess={() => setSelectedContractor(null)} />
        </div>
      )}
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

    if (!formData.supervisor_name || !formData.workers_count || !formData.machines_count || !formData.activity || !formData.location_name) {
      setError('يرجى إكمال جميع حقول التوثيق المطلوبة')
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

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">الموقع *</label>
          <input 
            type="text" 
            className="input py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 transition-all w-full" 
            placeholder="اسم الموقع" 
            value={formData.location_name}
            onChange={(e) => setFormData({...formData, location_name: e.target.value})}
            disabled={submitting}
          />
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
