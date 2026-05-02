import { Camera, Trash2, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function UploadArea({ label, value, onChange, id, disabled = false }) {
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)

  useEffect(() => {
    if (value && typeof value === 'object' && value instanceof File) {
      setFile(value)
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(value)
    }
  }, [value])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
        onChange(selectedFile)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setFile(null)
    onChange(null)
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        {preview ? (
          <div className="relative group aspect-video overflow-hidden rounded-2xl ring-1 ring-slate-200">
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
              <button 
                type="button" 
                onClick={handleRemove}
                disabled={disabled}
                className="rounded-full bg-rose-500 p-2 text-white shadow-lg hover:bg-rose-600 disabled:opacity-50"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ) : (
          <label 
            htmlFor={id} 
            className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <div className="mb-2 rounded-full bg-blue-100 p-3 text-blue-600">
                <Camera size={24} />
              </div>
              <p className="text-sm text-slate-500">انقر لرفع الصورة</p>
              <p className="text-xs text-slate-400">PNG, JPG, GIF (ماكس 5MB)</p>
            </div>
            <input 
              id={id} 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              disabled={disabled}
              className="hidden" 
            />
          </label>
        )}
      </div>
    </div>
  )
}
