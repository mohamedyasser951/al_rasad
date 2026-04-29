import { Plus, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { fetchReports } from '../api/endpoints'
import { EmptyState, ErrorState, LoadingState, StatusBadge } from '../components/common/States'
import LocationPicker from '../components/common/LocationPicker'
import UploadArea from '../components/common/UploadArea'
import useApiList from '../hooks/useApiList'

const filterDefaults = { search: '', status: '', type: '', contractor: '', created_at_after: '' }

export default function ReportsPage() {
  const [filters, setFilters] = useState(filterDefaults)
  const [selectedReportId, setSelectedReportId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  
  const params = useMemo(
    () => ({
      page: 1,
      page_size: 100,
      search: filters.search,
      status: filters.status,
      type: filters.type,
      contractor: filters.contractor,
      created_at_after: filters.created_at_after,
    }),
    [filters],
  )

  const { data: reports, loading, error } = useApiList(fetchReports, params)
  const selectedReport = useMemo(() => reports.find((item) => item.id === selectedReportId), [reports, selectedReportId])

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">البلاغات</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-md shadow-blue-100"
        >
          <Plus size={18} />
          <span>إضافة بلاغ جديد</span>
        </button>
      </header>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input className="input" placeholder="بحث..." value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} />
          <select className="input" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
            <option value="">جميع الحالات</option>
            <option value="new">جديد</option>
            <option value="in_progress">قيد التنفيذ</option>
            <option value="completed">مكتمل</option>
          </select>
          <input className="input" placeholder="النوع" value={filters.type} onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))} />
          <input className="input" placeholder="المقاول" value={filters.contractor} onChange={(e) => setFilters((p) => ({ ...p, contractor: e.target.value }))} />
          <input className="input" type="date" value={filters.created_at_after} onChange={(e) => setFilters((p) => ({ ...p, created_at_after: e.target.value }))} />
        </div>
      </section>

      <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        {loading && <LoadingState lines={5} />}
        {error && <ErrorState message="تعذر تحميل بيانات البلاغات." />}
        {!loading && !error && !reports.length && <EmptyState message="لا توجد بلاغات مطابقة للفلاتر." />}
        {!loading && !error && reports.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-4 font-semibold">رقم البلاغ</th>
                  <th className="px-4 py-4 font-semibold">النوع</th>
                  <th className="px-4 py-4 font-semibold">الموقع</th>
                  <th className="px-4 py-4 font-semibold">الحالة</th>
                  <th className="px-4 py-4 font-semibold">المقاول</th>
                  <th className="px-4 py-4 font-semibold">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-4">
                      <button type="button" className="font-bold text-blue-600 hover:underline" onClick={() => setSelectedReportId(report.id)}>
                        {report.report_number}
                      </button>
                    </td>
                    <td className="px-4 py-4">{report.type}</td>
                    <td className="px-4 py-4 text-slate-500">{report.location_name}</td>
                    <td className="px-4 py-4"><StatusBadge status={report.status} /></td>
                    <td className="px-4 py-4">{report.contractor?.name || 'غير محدد'}</td>
                    <td className="px-4 py-4 text-slate-500">{new Date(report.created_at).toLocaleDateString('ar-SA')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showForm && <NewReportForm onClose={() => setShowForm(false)} />}
      {selectedReport && <ReportDetails report={selectedReport} onClose={() => setSelectedReportId(null)} />}
    </div>
  )
}

function NewReportForm({ onClose }) {
  const [formData, setFormData] = useState({
    reportNumber: '',
    inspectorName: '',
    location: null,
    beforeImage: null,
    afterImage: null
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.reportNumber || !formData.inspectorName || !formData.location || !formData.beforeImage) {
      alert('يرجى إكمال جميع الحقول المطلوبة')
      return
    }
    console.log('Submitted Report:', formData)
    alert('تم حفظ البلاغ بنجاح (نسخة تجريبية)')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">إضافة بلاغ جديد</h2>
          <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">رقم البلاغ</label>
              <input 
                type="text" 
                className="input" 
                placeholder="مثال: R-1055" 
                value={formData.reportNumber}
                onChange={(e) => setFormData({...formData, reportNumber: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">اسم المراقب</label>
              <input 
                type="text" 
                className="input" 
                placeholder="اسم المراقب الثلاثي" 
                value={formData.inspectorName}
                onChange={(e) => setFormData({...formData, inspectorName: e.target.value})}
              />
            </div>
          </div>

          <LocationPicker 
            value={formData.location} 
            onChange={(loc) => setFormData({...formData, location: loc})} 
          />

          <div className="grid gap-4 md:grid-cols-2">
            <UploadArea 
              id="before" 
              label="صورة قبل" 
              value={formData.beforeImage}
              onChange={(img) => setFormData({...formData, beforeImage: img})}
            />
            <UploadArea 
              id="after" 
              label="صورة بعد" 
              value={formData.afterImage}
              onChange={(img) => setFormData({...formData, afterImage: img})}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="rounded-xl bg-slate-100 px-6 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200"
            >
              إلغاء
            </button>
            <button 
              type="submit"
              className="rounded-xl bg-blue-600 px-8 py-2 text-sm font-bold text-white shadow-lg shadow-blue-100 hover:bg-blue-700"
            >
              إتمام البلاغ
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ReportDetails({ report, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-xl font-bold text-slate-900">تفاصيل البلاغ {report.report_number}</h3>
          <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500 mb-1">اسم المراقب</p>
              <p className="font-bold text-slate-900">{report.observer_name}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500 mb-1">الموقع</p>
              <p className="font-bold text-slate-900">{report.location_name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 text-center">
              <img src={report.before_image} alt="قبل" className="aspect-video w-full rounded-2xl object-cover shadow-sm ring-1 ring-slate-100" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">صورة قبل</span>
            </div>
            <div className="space-y-2 text-center">
              <img src={report.after_image} alt="بعد" className="aspect-video w-full rounded-2xl object-cover shadow-sm ring-1 ring-slate-100" />
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">صورة بعد</span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50 p-4 text-blue-800">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2"><StatusBadge status={report.status} /></div>
              <span className="text-sm font-semibold">حالة البلاغ الحالية</span>
            </div>
            <span className="text-xs">{new Date(report.created_at).toLocaleDateString('ar-SA')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
