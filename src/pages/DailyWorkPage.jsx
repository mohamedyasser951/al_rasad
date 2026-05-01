import { ArrowRight, Building2, Save, User } from 'lucide-react'
import { useState } from 'react'
import LocationPicker from '../components/common/LocationPicker'
import UploadArea from '../components/common/UploadArea'

const COMPANIES = [
  { id: 1, name: "شركة العنزي للمقاولات العامة", color: "blue", icon: Building2 },
  { id: 2, name: "شركة اليمامة للأعمال التجارية والمقاولات", color: "indigo", icon: Building2 },
  { id: 3, name: "ﺷﺮﻛﺔ اﻟﺨﻠﻴﺔ اﻟﻤﺘﺤﺪة ﻟﻠﺨﺪﻣﺎت اﻟﺒﻴﺌﻴﺔ", color: "blue", icon: Building2 },
  { id: 4, name: "مؤسسة ذاعبلوتن للمقاولات العامة", color: "indigo", icon: Building2 },
]

export default function DailyWorkPage() {
  const [selectedCompany, setSelectedCompany] = useState(null)

  return (
    <div className="space-y-8 pb-10 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">توثيق الأعمال اليوميه</h1>
          <p className="text-sm text-slate-500">
            {selectedCompany ? `توثيق الإنجاز اليومي لـ ${selectedCompany.name}` : "اختر الشركة لبدء التوثيق"}
          </p>
        </div>
        {selectedCompany && (
          <button 
            onClick={() => setSelectedCompany(null)}
            className="flex items-center gap-2 text-sm font-bold text-blue-600 transition hover:text-blue-700"
          >
            <ArrowRight size={18} />
            تغيير الشركة
          </button>
        )}
      </header>

      {!selectedCompany ? (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {COMPANIES.map((company) => (
            <button
              key={company.id}
              onClick={() => setSelectedCompany(company)}
              className="group relative flex flex-col items-center justify-center gap-4 rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-xl hover:ring-blue-500 animate-fade-up"
            >
              <div className={`rounded-2xl p-4 transition-colors ${company.color === 'blue' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                <company.icon size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">{company.name}</h3>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">بدء التوثيق</div>
            </button>
          ))}
        </section>
      ) : (
        <div className="mx-auto max-w-3xl">
          <ContractorForm company={selectedCompany} />
        </div>
      )}
    </div>
  )
}

function ContractorForm({ company }) {
  const [formData, setFormData] = useState({
    supervisorName: '',
    workersCount: '',
    machinesCount: '',
    activity: '',
    notes: '',
    location: null,
    beforeImage: null,
    afterImage: null
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.supervisorName || !formData.workersCount || !formData.machinesCount || !formData.activity || !formData.location || !formData.beforeImage || !formData.afterImage) {
      alert('يرجى إكمال جميع حقول التوثيق')
      return
    }
    console.log(`Submitted Documentation for ${company.name}:`, formData)
    alert(`تم حفظ توثيق ${company.name} بنجاح`)
  }

  return (
    <article className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center gap-4 border-b border-slate-100 pb-6">
        <div className={`rounded-xl p-3 ${company.color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
          <company.icon size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">{company.name}</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">نموذج التوثيق اليومي</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">اسم المشرف</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                className="input pl-12 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 transition-all w-full" 
                placeholder="اسم المشرف المسؤول" 
                value={formData.supervisorName}
                onChange={(e) => setFormData({...formData, supervisorName: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">النشاط</label>
            <input 
              type="text" 
              className="input py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 transition-all w-full" 
              placeholder="وصف النشاط" 
              value={formData.activity}
              onChange={(e) => setFormData({...formData, activity: e.target.value})}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">عدد العمال</label>
            <input 
              type="number" 
              className="input py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 transition-all w-full" 
              placeholder="مثال: 15" 
              value={formData.workersCount}
              onChange={(e) => setFormData({...formData, workersCount: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">عدد الآلات</label>
            <input 
              type="number" 
              className="input py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 transition-all w-full" 
              placeholder="مثال: 3" 
              value={formData.machinesCount}
              onChange={(e) => setFormData({...formData, machinesCount: e.target.value})}
            />
          </div>
        </div>

        <LocationPicker 
          label="الموقع"
          value={formData.location} 
          onChange={(loc) => setFormData({...formData, location: loc})} 
        />

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">التقرير (ملاحظات)</label>
          <textarea 
            className="input bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 transition-all w-full min-h-[80px]"
            placeholder="اكتب تفاصيل التقرير أو الملاحظات..."
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <UploadArea 
            id={`before-${company.id}`} 
            label="صورة قبل العمل" 
            value={formData.beforeImage}
            onChange={(img) => setFormData({...formData, beforeImage: img})}
          />
          <UploadArea 
            id={`after-${company.id}`} 
            label="صورة بعد العمل" 
            value={formData.afterImage}
            onChange={(img) => setFormData({...formData, afterImage: img})}
          />
        </div>

        <button 
          type="submit"
          className={`flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-base font-bold text-white transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] ${company.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
        >
          <Save size={20} />
          <span>إرسال التوثيق اليومي</span>
        </button>
      </form>
    </article>
  )
}
