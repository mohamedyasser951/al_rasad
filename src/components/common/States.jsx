import { Inbox } from 'lucide-react'

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

export function EmptyState({ message = 'لا توجد بيانات حالياً.', icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center animate-fade-in">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400 shadow-sm ring-1 ring-slate-200/50">
        <Icon size={36} strokeWidth={1.5} className="text-slate-500" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-slate-800">لا توجد بيانات</h3>
      <p className="max-w-sm text-sm leading-relaxed text-slate-500">{message}</p>
    </div>
  )
}


