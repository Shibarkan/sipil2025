import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import AttendanceList from '../components/AttendanceList'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'

export default function HistoryPage() {
  const [kegiatan, setKegiatan] = useState([])
  const [selectedKegiatan, setSelectedKegiatan] = useState(null)
  const [absensi, setAbsensi] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchKegiatan()
  }, [])

  async function fetchKegiatan() {
    const { data, error } = await supabase
      .from('kegiatan')
      .select('id, nama, tanggal')
      .order('tanggal', { ascending: false })

    if (error) {
      console.error(error)
      toast.error('Gagal memuat daftar kegiatan.')
    } else {
      setKegiatan(data)
    }
  }

  async function fetchAbsensi(kegiatanId) {
    setLoading(true)
    setSelectedKegiatan(kegiatanId)

    const { data, error } = await supabase
      .from('presensi')
      .select('*')
      .eq('kegiatan_id', kegiatanId)
      .order('created_at', { ascending: false })

    setLoading(false)

    if (error) {
      console.error(error)
      toast.error('Gagal memuat data absensi.')
    } else {
      setAbsensi(data)
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">📚 History Absensi Kegiatan</h1>

      {/* Kalau belum pilih kegiatan */}
      {!selectedKegiatan && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kegiatan.map((k) => (
            <div
              key={k.id}
              onClick={() => fetchAbsensi(k.id)}
              className="cursor-pointer bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              <h2 className="font-semibold text-lg">{k.nama}</h2>
              <p className="text-sm text-gray-600">
                {dayjs(k.tanggal).format('DD MMM YYYY')}
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Klik untuk lihat absensi →
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Kalau sudah pilih kegiatan */}
      {selectedKegiatan && (
        <div className="mt-4">
          <button
            onClick={() => setSelectedKegiatan(null)}
            className="text-sm text-blue-600 mb-4 underline"
          >
            ← Kembali ke daftar kegiatan
          </button>

          {loading ? (
            <p className="text-gray-500">Memuat data absensi...</p>
          ) : absensi.length > 0 ? (
            <AttendanceList attendances={absensi} />
          ) : (
            <p className="text-gray-500">Belum ada presensi untuk kegiatan ini.</p>
          )}
        </div>
      )}
    </div>
  )
}
