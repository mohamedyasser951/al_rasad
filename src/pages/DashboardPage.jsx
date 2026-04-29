import { AlertTriangle, CheckCircle2, Clock3, FolderKanban } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useMemo } from 'react'
import { fetchReports } from '../api/endpoints'
import { EmptyState, ErrorState, LoadingState, StatusBadge } from '../components/common/States'
import { mockAlerts } from '../data/mockData'
import useApiList from '../hooks/useApiList'

const colors = { completed: '#10b981', in_progress: '#f59e0b', delayed: '#ef4444' }

const markers = { completed: 'bg-emerald-500', in_progress: 'bg-amber-500', delayed: 'bg-red-500' }

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
    { name: 'جديد', key: 'delayed', value: reports.filter((r) => r.status === 'delayed').length },
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
          <div className="relative h-72 overflow-hidden rounded-xl bg-gradient-to-br from-blue-100 to-slate-100">
            {reports.slice(0, 8).map((report, index) => (
              <div
                key={report.id}
                className={`absolute rounded-full px-2 py-1 text-xs text-white ${markers[report.status] || 'bg-slate-600'}`}
                style={{ right: `${10 + (index % 4) * 22}%`, top: `${18 + ((index * 13) % 60)}%` }}
              >
                {report.location_name}
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge status="completed" />
            <StatusBadge status="in_progress" />
            <StatusBadge status="delayed" />
          </div>
        </article>

        <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-2 text-lg font-bold">مؤشر الحالات</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={78}>
                  {statusData.map((entry) => (
                    <Cell key={entry.key} fill={colors[entry.key]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
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
