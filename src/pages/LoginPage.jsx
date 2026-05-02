import { AlertCircle, Eye, EyeOff, Lock, Mail, ShieldCheck, Activity } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, error: authError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('الرجاء إدخال البريد الإلكتروني وكلمة المرور')
      return
    }

    setLoading(true)
    try {
      const success = await login(email, password)
      if (success) {
        navigate('/dashboard', { replace: true })
      } else {
        setError(authError || 'فشل تسجيل الدخول')
      }
    } catch (err) {
      setError('حدث خطأ أثناء تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#f8fafc] flex items-center justify-center p-6" dir="rtl">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Soft Blue Floating Blobs */}
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-indigo-400/10 rounded-full blur-[120px] animate-float [animation-delay:2s]" />
        
        {/* Subtle Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.02]" 
             style={{ backgroundImage: 'radial-gradient(#1e40af 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="w-full max-w-[450px] relative z-10 animate-fade-up">
        <div className="glass-clean rounded-[2.5rem] p-10 border border-white relative overflow-hidden card-float shadow-2xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-6 shadow-xl shadow-blue-200 transform hover:rotate-6 transition-transform duration-500">
              <ShieldCheck className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">الراصد</h1>
            <p className="text-sm font-bold text-slate-400 tracking-wide uppercase">Monitoring & Operations</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl animate-fade-in">
                <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
                <p className="text-sm font-bold text-rose-600 leading-tight">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mr-2">البريد الإلكتروني</label>
              <div className="relative group">
                <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@rasad.gov"
                  className="w-full pr-14 pl-6 py-4 input-clean rounded-2xl text-sm font-bold focus:outline-none shadow-sm"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mr-2">كلمة المرور</label>
              <div className="relative group">
                <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-14 pl-14 py-4 input-clean rounded-2xl text-sm font-bold focus:outline-none shadow-sm"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full group relative py-5 bg-blue-600 text-white font-black text-sm rounded-2xl overflow-hidden hover:bg-blue-700 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 mt-4 shadow-lg shadow-blue-200"
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Activity size={18} />
                    <span>دخول للنظام</span>
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-slate-100 flex justify-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
              © Rasad Systems 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
