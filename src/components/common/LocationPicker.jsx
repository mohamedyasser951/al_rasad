import { MapPin, Navigation } from 'lucide-react'
import { useState } from 'react'

export default function LocationPicker({ value, onChange }) {
  const [loading, setLoading] = useState(false)

  const detectLocation = () => {
    setLoading(true)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          onChange({ lat: latitude.toFixed(6), lng: longitude.toFixed(6) })
          setLoading(false)
        },
        (error) => {
          console.error("Error detecting location:", error)
          // Fallback for demo
          onChange({ lat: "24.7136", lng: "46.6753" })
          setLoading(false)
        }
      )
    } else {
      alert("المتصفح لا يدعم تحديد الموقع")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">موقع البلاغ (GPS)</label>
      <div className="flex items-center gap-2">
        <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 ring-offset-2 focus-within:ring-2 focus-within:ring-blue-200">
          {value ? (
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-600" />
              <span>{value.lat}, {value.lng}</span>
            </div>
          ) : (
            <span className="text-slate-400">إحداثيات الموقع...</span>
          )}
        </div>
        <button
          type="button"
          onClick={detectLocation}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          <Navigation size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "جاري التحديد..." : "تحديد موقعي"}
        </button>
      </div>
    </div>
  )
}
