import { AlertCircle, FileText, Plus, User, X } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import { fetchReports } from '../api/endpoints'
import { reportService, contractorService } from '../api/services'
import { EmptyState, ErrorState, LoadingState } from '../components/common/States'
import LocationPicker from '../components/common/LocationPicker'
import UploadArea from '../components/common/UploadArea'
import useApiList from '../hooks/useApiList'

const filterDefaults = { search: '', type: '', contractor: '', created_at_after: '' }

export default function ReportsPage() {
  const [filters, setFilters] = useState(filterDefaults)
  const [selectedReportId, setSelectedReportId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  
  const params = useMemo(
    () => ({
      page: 1,
      page_size: 100,
      search: filters.search,
      type: filters.type,
      contractor: filters.contractor,
      created_at_after: filters.created_at_after,
    }),
    [filters],
  )

  const { data: reports, loading, error } = useApiList(fetchReports, params)
  const selectedReport = useMemo(() => reports.find((item) => item.id === selectedReportId), [reports, selectedReportId])

  return (
    <div className="space-y-4 animate-fade-in">
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
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input className="input" placeholder="بحث..." value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} />
          <select className="input" value={filters.type} onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}>
            <option value="">جميع الأنواع</option>
            <option value="lighting">إنارة</option>
            <option value="asphalt">أسفلت</option>
            <option value="sidewalk">أرصفة</option>
            <option value="other">أخرى</option>
          </select>
          <input className="input" placeholder="المقاول" value={filters.contractor} onChange={(e) => setFilters((p) => ({ ...p, contractor: e.target.value }))} />
          <input className="input" type="date" value={filters.created_at_after} onChange={(e) => setFilters((p) => ({ ...p, created_at_after: e.target.value }))} />
        </div>
      </section>

      <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 animate-fade-up">
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
                  <th className="px-4 py-4 font-semibold">المقاول</th>
                  <th className="px-4 py-4 font-semibold">الحالة</th>
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
                    <td className="px-4 py-4">{report.type_display}</td>
                    <td className="px-4 py-4 text-slate-500">{report.location_name}</td>
                    <td className="px-4 py-4">{report.contractor?.name || 'غير محدد'}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                        {report.status_display}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-500">{new Date(report.created_at).toLocaleDateString('ar-SA')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showForm && <NewReportForm onClose={() => { setShowForm(false); window.location.reload(); }} />}
      {selectedReport && <ReportDetails report={selectedReport} onClose={() => setSelectedReportId(null)} />}
    </div>
  )
}

function NewReportForm({ onClose }) {
  const [formData, setFormData] = useState({
    observer_name: '',
    contractor_id: '',
    type: '',
    notes: '',
    location_name: '',
    latitude: '',
    longitude: '',
    status: 'new',
    before_image: null,
    after_image: null
  })
  const [contractors, setContractors] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Load contractors
  useEffect(() => {
    contractorService.list({ is_active: true }).then(res => {
      setContractors(res.data?.results || [])
    }).catch(err => console.error('Failed to load contractors:', err))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.observer_name || !formData.type || !formData.location_name) {
      setError('يرجى إكمال جميع الحقول المطلوبة')
      return
    }

    setSubmitting(true)
    try {
      const submitData = new FormData()
      submitData.append('observer_name', formData.observer_name)
      submitData.append('type', formData.type)
      submitData.append('location_name', formData.location_name)
      submitData.append('status', formData.status)
      if (formData.latitude) submitData.append('latitude', formData.latitude)
      if (formData.longitude) submitData.append('longitude', formData.longitude)
      if (formData.notes) submitData.append('notes', formData.notes)
      if (formData.contractor_id) submitData.append('contractor_id', formData.contractor_id)
      if (formData.before_image) submitData.append('before_image', formData.before_image)
      if (formData.after_image) submitData.append('after_image', formData.after_image)

      await reportService.create(submitData)
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'فشل حفظ البلاغ')
    } finally {
      setSubmitting(false)
    }
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

        {error && (
          <div className="flex items-center gap-3 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">اسم المراقب *</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  className="input pl-12 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 transition-all" 
                  placeholder="اسم المراقب الثلاثي" 
                  value={formData.observer_name}
                  onChange={(e) => setFormData({...formData, observer_name: e.target.value})}
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">نوع البلاغ *</label>
              <select
                className="input bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 transition-all w-full"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                disabled={submitting}
              >
                <option value="" disabled>اختر النوع</option>
                <option value="lighting">إنارة</option>
                <option value="asphalt">أسفلت</option>
                <option value="sidewalk">أرصفة</option>
                <option value="other">أخرى</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">المقاول</label>
              <select
                className="input bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 transition-all w-full"
                value={formData.contractor_id}
                onChange={(e) => setFormData({...formData, contractor_id: e.target.value})}
                disabled={submitting}
              >
                <option value="">بدون مقاول</option>
                {contractors.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">الموقع *</label>
              <input 
                type="text" 
                className="input bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 transition-all" 
                placeholder="اسم الموقع" 
                value={formData.location_name}
                onChange={(e) => setFormData({...formData, location_name: e.target.value})}
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
            <label className="text-sm font-semibold text-slate-700">تفاصيل البلاغ</label>
            <textarea 
              className="input bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 transition-all w-full min-h-[80px]"
              placeholder="اكتب تفاصيل البلاغ هنا..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              disabled={submitting}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <UploadArea 
              id="before" 
              label="صورة قبل" 
              value={formData.before_image}
              onChange={(img) => setFormData({...formData, before_image: img})}
              disabled={submitting}
            />
            <UploadArea 
              id="after" 
              label="صورة بعد" 
              value={formData.after_image}
              onChange={(img) => setFormData({...formData, after_image: img})}
              disabled={submitting}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl bg-slate-100 px-6 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-50"
            >
              إلغاء
            </button>
            <button 
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-blue-600 px-8 py-2 text-sm font-bold text-white shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'جاري الحفظ...' : 'إتمام البلاغ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


function ReportDetails({ report, onClose }) {
  const beforeImageUrl = report.before_image_url || report.before_image
  const afterImageUrl = report.after_image_url || report.after_image

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
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500 mb-1">نوع البلاغ</p>
              <p className="font-bold text-slate-900">{report.type_display}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500 mb-1">الحالة</p>
              <p className="font-bold text-slate-900">{report.status_display}</p>
            </div>
          </div>

          {(beforeImageUrl || afterImageUrl) && (
            <div className="grid grid-cols-2 gap-4">
              {beforeImageUrl && (
                <div className="space-y-2 text-center">
                  <img src={beforeImageUrl} alt="قبل" className="aspect-video w-full rounded-2xl object-cover shadow-sm ring-1 ring-slate-100" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">صورة قبل</span>
                </div>
              )}
              {afterImageUrl && (
                <div className="space-y-2 text-center">
                  <img src={afterImageUrl} alt="بعد" className="aspect-video w-full rounded-2xl object-cover shadow-sm ring-1 ring-slate-100" />
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">صورة بعد</span>
                </div>
              )}
            </div>
          )}

          {report.notes && (
            <div className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-slate-600">
              <span className="text-sm font-semibold border-b border-slate-200 pb-2">تفاصيل البلاغ</span>
              <p className="text-sm leading-relaxed text-slate-700">{report.notes}</p>
            </div>
          )}

          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 text-slate-600">
            <span className="text-sm font-semibold">تاريخ البلاغ</span>
            <span className="text-xs">{new Date(report.created_at).toLocaleDateString('ar-SA')}</span>
          </div>

          {report.contractor && (
            <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 text-slate-600">
              <span className="text-sm font-semibold">المقاول</span>
              <span className="text-xs font-bold">{report.contractor.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
