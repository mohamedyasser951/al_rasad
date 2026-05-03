import { useState } from 'react'
import { Shield, Key, CheckCircle2 } from 'lucide-react'
import { authService } from '../api/services'

export default function SettingsPage() {
  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (passwords.new_password !== passwords.confirm_password) {
      setError('كلمات المرور الجديدة غير متطابقة')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await authService.changePassword({
        old_password: passwords.old_password,
        new_password: passwords.new_password
      })
      setSuccess(true)
      setPasswords({ old_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      setError(err.response?.data?.detail || 'فشل تغيير كلمة المرور. يرجى التأكد من كلمة المرور الحالية.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in" dir="rtl">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">الإعدادات</h1>
        <p className="text-sm text-slate-500">إدارة حسابك وتفضيلات النظام</p>
      </header>

      <div className="grid gap-6">
        <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="mb-6 flex items-center gap-3 text-blue-600">
            <div className="rounded-xl bg-blue-50 p-2">
              <Shield size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">أمان الحساب</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">كلمة المرور الحالية</label>
              <input 
                required
                type="password"
                className="input w-full"
                value={passwords.old_password}
                onChange={e => setPasswords({...passwords, old_password: e.target.value})}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">كلمة المرور الجديدة</label>
                <input 
                  required
                  type="password"
                  className="input w-full"
                  value={passwords.new_password}
                  onChange={e => setPasswords({...passwords, new_password: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">تأكيد كلمة المرور الجديدة</label>
                <input 
                  required
                  type="password"
                  className="input w-full"
                  value={passwords.confirm_password}
                  onChange={e => setPasswords({...passwords, confirm_password: e.target.value})}
                />
              </div>
            </div>

            {error && <p className="text-sm font-medium text-rose-600 bg-rose-50 p-3 rounded-xl">{error}</p>}
            {success && (
              <div className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 p-3 rounded-xl">
                <CheckCircle2 size={18} />
                <span>تم تغيير كلمة المرور بنجاح</span>
              </div>
            )}

            <div className="pt-4">
              <button 
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3 font-bold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700 disabled:opacity-50"
              >
                <Key size={18} />
                <span>{loading ? 'جاري التحديث...' : 'تغيير كلمة المرور'}</span>
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
