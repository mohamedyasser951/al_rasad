import { AlertTriangle, CheckCircle2, Clock3, FolderKanban } from 'lucide-react'
import { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { fetchReports } from '../api/endpoints'
import { EmptyState, ErrorState, LoadingState } from '../components/common/States'
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

function normalizeKpis(reports) {
  const dailyCount = reports.filter(r => new Date(r.created_at).toDateString() === new Date().toDateString()).length || reports.length
  const activeContractors = new Set(reports.map((item) => item.contractor?.id)).size
  const totalReports = reports.length
  return { dailyCount, activeContractors, totalReports }
}

export default function DashboardPage() {
  const params = useMemo(() => ({ page: 1, page_size: 100 }), [])
  const { data: reports, loading, error } = useApiList(fetchReports, params)

  if (loading) return <LoadingState lines={6} />
  if (error) return <ErrorState message="تعذر تحميل لوحة التحكم." />
  if (!reports.length) return <EmptyState message="لا توجد بيانات للوحة التحكم حالياً." />

  const kpis = normalizeKpis(reports)

  return (
    <div className="space-y-5 animate-fade-in">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <KpiCard icon={<Clock3 size={18} />} title="إجمالي البلاغات" value={kpis.totalReports} />
        <KpiCard icon={<Clock3 size={18} />} title="بلاغات اليوم" value={kpis.dailyCount} />
        <KpiCard icon={<FolderKanban size={18} />} title="المقاولين النشطين" value={kpis.activeContractors} />
      </section>

      <section className="grid gap-4">
        <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
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
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>
        </article>
      </section>
    </div>
  )
}

function KpiCard({ icon, title, value }) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md hover:-translate-y-1 animate-fade-up">
      <div className="mb-3 flex items-center gap-2.5 text-sm font-semibold text-slate-500">{icon} {title}</div>
      <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
    </article>
  )
}
