import { AlertTriangle, CheckCircle2, Clock3, FolderKanban, Activity, BarChart3 } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { fetchReports } from '../api/endpoints'
import { dashboardService } from '../api/services'
import { ErrorState, LoadingState } from '../components/common/States'
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

export default function DashboardPage() {
  const [kpis, setKpis] = useState(null)
  const [loadingKpis, setLoadingKpis] = useState(true)
  const [errorKpis, setErrorKpis] = useState(null)
  
  const params = useMemo(() => ({ page: 1, page_size: 100 }), [])
  const { data: reports, loading: loadingReports, error: errorReports } = useApiList(fetchReports, params)

  useEffect(() => {
    dashboardService.getKpi()
      .then(res => {
        setKpis(res.data)
        setLoadingKpis(false)
      })
      .catch(err => {
        console.error('Failed to load dashboard KPIs:', err)
        setErrorKpis(err)
        setLoadingKpis(false)
      })
  }, [])

  if (loadingReports || loadingKpis) return <LoadingState lines={6} />
  if (errorReports || errorKpis) return <ErrorState message="تعذر تحميل لوحة التحكم." />

  return (
    <div className="space-y-5 animate-fade-in">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={<FolderKanban size={18} />} title="المقاولين" value={kpis?.total_contractors || 0} />
        <KpiCard icon={<Activity size={18} />} title="المقاولين النشطين" value={kpis?.active_contractors || 0} />
        <KpiCard icon={<Clock3 size={18} />} title="إجمالي البلاغات" value={kpis?.total_reports || 0} />
        <KpiCard icon={<BarChart3 size={18} />} title="الأعمال اليومية" value={kpis?.total_daily_work || 0} />
      </section>

      {/* Breakdown by status if available */}
      {kpis?.reports_by_status && (
        <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          {Object.entries(kpis.reports_by_status).map(([status, count]) => (
            <div key={status} className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
              <p className="text-[10px] font-bold text-slate-500 uppercase">{status}</p>
              <p className="text-lg font-black text-slate-900">{count}</p>
            </div>
          ))}
        </section>
      )}

      <section className="grid gap-4">
        <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-lg font-bold">خريطة البلاغات (GPS)</h2>
          <div className="relative h-[500px] overflow-hidden rounded-xl border border-slate-100">
            <MapContainer
              center={[24.7136, 46.6753]}
              zoom={11}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {reports.map((report) => (
                report.latitude && report.longitude && (
                  <Marker key={report.id} position={[parseFloat(report.latitude), parseFloat(report.longitude)]}>
                    <Popup>
                      <div className="text-right font-sans">
                        <p className="font-bold text-blue-600">{report.report_number}</p>
                        <p className="text-xs text-slate-500">{report.location_name}</p>
                        <p className="text-xs text-slate-500">{report.type_display}</p>
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

function KpiCard({ icon, title, value, color = 'blue' }) {
  const colorClass = color === 'red' ? 'text-red-600' : 'text-blue-600'
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md hover:-translate-y-1 animate-fade-up">
      <div className={`mb-3 flex items-center gap-2.5 text-sm font-semibold ${colorClass}`}>{icon} {title}</div>
      <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
    </article>
  )
}
