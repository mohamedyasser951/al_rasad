export function LoadingState({ lines = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="h-4 animate-pulse rounded bg-slate-200" />
      ))}
    </div>
  )
}

export function ErrorState({ message = 'تعذر تحميل البيانات حالياً.' }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
      {message}
    </div>
  )
}

export function EmptyState({ message = 'لا توجد بيانات حالياً.' }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">
      {message}
    </div>
  )
}

export function StatusBadge({ status }) {
  const statusMap = {
    new: 'جديد',
    in_progress: 'قيد التنفيذ',
    completed: 'مكتمل',
  }

  const colorMap = {
    new: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-amber-100 text-amber-700',
    completed: 'bg-emerald-100 text-emerald-700',
  }

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colorMap[status] || colorMap.pending}`}>
      {statusMap[status] || status}
    </span>
  )
}
