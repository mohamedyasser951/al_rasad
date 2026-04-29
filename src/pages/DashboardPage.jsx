import { AlertTriangle, CheckCircle2, Clock3, FolderKanban } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { fetchReports } from '../api/endpoints'
import { EmptyState, ErrorState, LoadingState, StatusBadge } from '../components/common/States'
import { mockAlerts } from '../data/mockData'
import useApiList from '../hooks/useApiList'

// Fix for Leaflet default icons
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

const colors = { completed: '#10b981', in_progress: '#f59e0b', delayed: '#ef4444', new: '#3b82f6' }

function normalizeKpis(reports) {
  const dailyCount = reports.filter(r => new Date(r.created_at).toDateString() === new Date().toDateString()).length || reports.length
  const completed = reports.filter((item) => item.status === 'completed').length
  const completionRate = reports.length ? Math.round((completed / reports.length) * 100) : 0
  const activeContractors = new Set(reports.map((item) => item.contractor?.id)).size
  return { dailyCount, completionRate, activeContractors }
}

export default function DashboardPage() {
  const params = useMemo(() => ({ page: 1, page_size: 100 }), [])
  const { data: reports, loading, error } = useApiList(fetchReports, params)

  if (loading) return <LoadingState lines={6} />
  if (error) return <ErrorState message="تعذر تحميل لوحة التحكم." />
  if (!reports.length) return <EmptyState message="لا توجد بيانات للوحة التحكم حالياً." />

  const kpis = normalizeKpis(reports)
  const statusData = [
    { name: 'مكتمل', key: 'completed', value: reports.filter((r) => r.status === 'completed').length },
    { name: 'قيد التنفيذ', key: 'in_progress', value: reports.filter((r) => r.status === 'in_progress').length },
    { name: 'جديد', key: 'new', value: reports.filter((r) => r.status === 'new').length },
  ].filter((item) => item.value > 0)

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <KpiCard icon={<Clock3 size={18} />} title="عدد البلاغات اليومية" value={kpis.dailyCount} />
        <KpiCard icon={<CheckCircle2 size={18} />} title="معدل الإنجاز %" value={`${kpis.completionRate}%`} />
        <KpiCard icon={<FolderKanban size={18} />} title="نشاط المقاولين" value={kpis.activeContractors} />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 xl:col-span-2">
          <h2 className="mb-4 text-lg font-bold">خريطة البلاغات (GPS)</h2>
          <div className="relative h-80 overflow-hidden rounded-xl border border-slate-100">
            <MapContainer 
              center={[24.7136, 46.6753]} 
              zoom={11} 
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {reports.map((report) => (
                report.latitude && report.longitude && (
                  <Marker key={report.id} position={[report.latitude, report.longitude]}>
                    <Popup>
                      <div className="text-right font-sans">
                        <p className="font-bold text-blue-600">{report.report_number}</p>
                        <p className="text-xs text-slate-500">{report.location_name}</p>
                        <div className="mt-2"><StatusBadge status={report.status} /></div>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge status="completed" />
            <StatusBadge status="in_progress" />
            <StatusBadge status="new" />
          </div>
        </article>

        <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-2 text-lg font-bold">مؤشر الحالات</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={5}>
                  {statusData.map((entry) => (
                    <Cell key={entry.key} fill={colors[entry.key]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-2">
            {statusData.map(item => (
              <div key={item.key} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[item.key] }} />
                  {item.name}
                </span>
                <span className="font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h2 className="mb-3 text-lg font-bold">التنبيهات التشغيلية</h2>
        <div className="grid gap-2 md:grid-cols-2">
          {mockAlerts.map((item) => (
            <p key={item.id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {item.text}
            </p>
          ))}
        </div>
      </section>
    </div>
  )
}

function KpiCard({ icon, title, value }) {
  return (
    <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-600">{icon} {title}</div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </article>
  )
}
