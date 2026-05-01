import { MapPin, Navigation, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

// Fix for default marker icons in Leaflet + React
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

export default function LocationPicker({ value, onChange, label }) {
  const [showMap, setShowMap] = useState(false)
  const [loading, setLoading] = useState(false)

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`)
      const data = await response.json()
      // Extract a cleaner address from Nominatim data
      const address = data.display_name.split(',').slice(0, 3).join(',')
      return address || "موقع غير معروف"
    } catch (error) {
      console.error("Reverse geocoding error:", error)
      return "إحداثيات الموقع"
    }
  }

  const handleLocationSelect = async (lat, lng) => {
    setLoading(true)
    const address = await reverseGeocode(lat, lng)
    onChange({ lat, lng, address })
    setLoading(false)
    setShowMap(false)
  }

  const detectLocation = () => {
    if ("geolocation" in navigator) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          const address = await reverseGeocode(latitude, longitude)
          onChange({ lat: latitude.toFixed(6), lng: longitude.toFixed(6), address })
          setLoading(false)
        },
        () => {
          // Fallback for Riyadh
          handleLocationSelect(24.7136, 46.6753)
        }
      )
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">{label || "موقع البلاغ (GPS)"}</label>
      <div className="flex flex-col gap-2">
        <div 
          onClick={() => setShowMap(true)}
          className="flex flex-1 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 transition hover:bg-slate-100"
        >
          <MapPin size={18} className="text-blue-600" />
          {loading ? (
            <span className="animate-pulse">جاري تحديد العنوان...</span>
          ) : (
            <span className={value?.address ? "text-slate-900 font-medium" : "text-slate-400"}>
              {value?.address || "انقر لاختيار الموقع من الخريطة..."}
            </span>
          )}
        </div>
        
        <button
          type="button"
          onClick={detectLocation}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900"
        >
          <Navigation size={16} className={loading ? "animate-spin" : ""} />
          <span>تحديد تلقائي</span>
        </button>
      </div>

      {showMap && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative h-[80vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-slate-100 p-4">
              <h3 className="font-bold text-slate-900">اختر الموقع من الخريطة</h3>
              <button onClick={() => setShowMap(false)} className="rounded-full bg-slate-100 p-2 hover:bg-slate-200">
                <X size={20} />
              </button>
            </header>
            
            <div className="h-full w-full">
              <MapContainer 
                center={[value?.lat || 24.7136, value?.lng || 46.6753]} 
                zoom={13} 
                style={{ height: 'calc(100% - 65px)', width: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker onSelect={handleLocationSelect} />
                {value?.lat && <Marker position={[value.lat, value.lng]} />}
              </MapContainer>
            </div>
            
            <footer className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000]">
               <div className="rounded-full bg-white/90 px-6 py-3 text-sm font-bold shadow-lg backdrop-blur-md">
                 انقر على الخريطة لتحديد الموقع 📍
               </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}

function LocationMarker({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6))
    },
  })
  return null
}
