import React from 'react'
import dayjs from 'dayjs'
import { Trash2 } from 'lucide-react'

export default function AttendanceList({ attendances, onDelete }) {
  if (!attendances || attendances.length === 0)
    return <p className="text-sm text-gray-500">Belum ada presensi.</p>

  // 🔹 Kelompokkan data berdasarkan kelas
  const grouped = attendances.reduce((acc, cur) => {
    const kls = cur.kelas || 'Tanpa Kelas'
    if (!acc[kls]) acc[kls] = []
    acc[kls].push(cur)
    return acc
  }, {})

  // 🔹 Urutkan kelas agar A–B–C–D–IUP
  const classOrder = ['A', 'B', 'C', 'D', 'IUP']

  return (
    <div className="space-y-8">
      {classOrder.map((kls) => {
        const data = grouped[kls]
        if (!data) return null

        return (
          <div key={kls}>
            <h2 className="text-lg font-semibold mb-2">Kelas {kls}  (Tabel bisa digeser)</h2>

            {/* Wrapper agar tabel bisa di-scroll di HP */}
            <div className="w-full overflow-x-auto border rounded-lg shadow-sm">
              <table className="min-w-full text-sm md:text-base border-collapse">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-2 md:p-3 text-left">Waktu</th>
                    <th className="p-2 md:p-3 text-left">Nama</th>
                    <th className="p-2 md:p-3 text-left">NIM</th>
                    <th className="p-2 md:p-3 text-left">Kelas</th>
                    <th className="p-2 md:p-3 text-left">Asal</th>
                    <th className="p-2 md:p-3 text-left">Mengikuti</th>
                    <th className="p-2 md:p-3 text-left">Lokasi</th>
                    <th className="p-2 md:p-3 text-left">Foto</th>
                    <th className="p-2 md:p-3 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((a) => (
                    <tr key={a.id} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="p-2">{dayjs(a.created_at).format('DD MMM YYYY HH:mm')}</td>
                      <td className="p-2">{a.nama}</td>
                      <td className="p-2">{a.nim}</td>
                      <td className="p-2">{a.kelas}</td>
                      <td className="p-2">{a.asal || '-'}</td>
                      <td className="p-2">{a.mengikuti ? '✅ Ya' : '❌ Tidak'}</td>

                      {/* Lokasi */}
                      <td className="p-2 text-xs">
                        {a.lokasi_lat && a.lokasi_lng ? (
                          <div className="flex flex-col">
                            {a.lokasi_detail ? (
                              <span>{a.lokasi_detail}</span>
                            ) : (
                              <span>{a.lokasi_lat.toFixed(5)}, {a.lokasi_lng.toFixed(5)}</span>
                            )}
                            <a
                              href={`https://www.google.com/maps?q=${a.lokasi_lat},${a.lokasi_lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Lihat di Maps
                            </a>
                          </div>
                        ) : (
                          <span className="text-gray-400">Tidak terdeteksi</span>
                        )}
                      </td>

                      {/* Foto */}
                      <td className="p-2">
                        {a.foto_url ? (
                          <a href={a.foto_url} target="_blank" rel="noopener noreferrer">
                            <img
                              src={a.foto_url}
                              alt="foto"
                              className="w-20 h-14 object-cover rounded border"
                            />
                          </a>
                        ) : ('-')}
                      </td>

                      {/* 🔹 Tombol Hapus */}
                      <td className="p-2 text-center">
                        <button
                          onClick={() => onDelete(a.id, a.foto_path)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
                          title="Hapus presensi"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}
