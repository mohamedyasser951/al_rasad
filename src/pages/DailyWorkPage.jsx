import { History, Save, Send, User } from 'lucide-react'
import { useMemo, useState } from 'react'
import { fetchDailyWork } from '../api/endpoints'
import { EmptyState, ErrorState, LoadingState } from '../components/common/States'
import LocationPicker from '../components/common/LocationPicker'
import UploadArea from '../components/common/UploadArea'
import useApiList from '../hooks/useApiList'

export default function DailyWorkPage() {
  const [activeItem, setActiveItem] = useState(null)
  const params = useMemo(() => ({ page: 1, page_size: 100 }), [])
  const { data, loading, error } = useApiList(fetchDailyWork, params)

  if (loading) return <LoadingState lines={4} />
  if (error) return <ErrorState message="تعذر تحميل توثيق الأعمال اليومية." />

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">توثيق أعمال المقاولين</h1>
        <p className="text-sm text-slate-500">توثيق الإنجاز الميداني اليومي لكل شركة</p>
      </header>

      {/* Entry Forms Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ContractorForm companyName="شركة العنزي للمقاولات" accentColor="blue" />
        <ContractorForm companyName="شركة اليمامة للمقاولات" accentColor="indigo" />
      </div>

      {/* History Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <History size={20} className="text-slate-400" />
          <h2 className="text-lg font-bold text-slate-800">السجلات السابقة</h2>
        </div>
        
        {!data.length ? (
          <EmptyState message="لا توجد سجلات يومية حالياً." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.map((item) => (
              <article
                key={item.id}
                className="group rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
              >
                <div className="grid grid-cols-2 gap-2">
                  <img src={item.before_image} alt="قبل" className="aspect-video w-full rounded-xl object-cover" />
                  <img src={item.after_image} alt="بعد" className="aspect-video w-full rounded-xl object-cover" />
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <p className="font-bold text-slate-900">{item.contractor?.name}</p>
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="flex items-center gap-1"><User size={14} /> {item.supervisor_name}</span>
                    <span>{new Date(item.created_at).toLocaleDateString('ar-SA')}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveItem(item)}
                  className="mt-3 w-full rounded-xl border border-slate-200 bg-white py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  عرض التفاصيل
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {activeItem && <DailyWorkDetail item={activeItem} onClose={() => setActiveItem(null)} />}
    </div>
  )
}

function ContractorForm({ companyName, accentColor }) {
  const [formData, setFormData] = useState({
    supervisorName: '',
    location: null,
    beforeImage: null,
    afterImage: null
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.supervisorName || !formData.location || !formData.beforeImage || !formData.afterImage) {
      alert('يرجى إكمال جميع حقول التوثيق')
      return
    }
    console.log(`Submitted Documentation for ${companyName}:`, formData)
    alert(`تم حفظ توثيق ${companyName} بنجاح`)
  }

  const colorClasses = {
    blue: 'border-blue-100 bg-blue-50/30 text-blue-700 hover:bg-blue-600',
    indigo: 'border-indigo-100 bg-indigo-50/30 text-indigo-700 hover:bg-indigo-600'
  }

  return (
    <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h3 className="mb-4 text-xl font-bold text-slate-800">{companyName}</h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">اسم المشرف</label>
          <div className="relative">
            <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              className="input pr-10" 
              placeholder="اسم المشرف المسؤول" 
              value={formData.supervisorName}
              onChange={(e) => setFormData({...formData, supervisorName: e.target.value})}
            />
          </div>
        </div>

        <LocationPicker 
          value={formData.location} 
          onChange={(loc) => setFormData({...formData, location: loc})} 
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <UploadArea 
            id={`before-${companyName}`} 
            label="صورة قبل العمل" 
            value={formData.beforeImage}
            onChange={(img) => setFormData({...formData, beforeImage: img})}
          />
          <UploadArea 
            id={`after-${companyName}`} 
            label="صورة بعد العمل" 
            value={formData.afterImage}
            onChange={(img) => setFormData({...formData, afterImage: img})}
          />
        </div>

        <button 
          type="submit"
          className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white transition shadow-lg shadow-blue-100 ${accentColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          <Save size={18} />
          <span>حفظ التوثيق اليومي</span>
        </button>
      </form>
    </article>
  )
}

function DailyWorkDetail({ item, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">تفاصيل التوثيق اليومي</h3>
          <button type="button" className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200" onClick={onClose}>إغلاق</button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <img src={item.before_image} alt="قبل" className="aspect-video w-full rounded-2xl object-cover" />
          <img src={item.after_image} alt="بعد" className="aspect-video w-full rounded-2xl object-cover" />
        </div>
        <div className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500">المقاول:</span>
            <span className="font-bold">{item.contractor?.name}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500">المشرف:</span>
            <span className="font-bold">{item.supervisor_name}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500">الموقع:</span>
            <span className="font-bold">{item.latitude}, {item.longitude}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">التاريخ:</span>
            <span className="font-bold">{new Date(item.created_at).toLocaleDateString('ar-SA')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
