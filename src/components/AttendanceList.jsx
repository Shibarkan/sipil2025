import React from 'react'

export default function AttendanceList({ attendances }) {
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
            <h2 className="text-lg font-semibold mb-2">
              Kelas {kls}
            </h2>

            <div className="overflow-x-auto border rounded">
              <table className="min-w-full border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Waktu</th>
                    <th className="p-2 text-left">Nama</th>
                    <th className="p-2 text-left">NIM</th>
                    <th className="p-2 text-left">Kelas</th>
                    <th className="p-2 text-left">Mengikuti</th>
                    <th className="p-2 text-left">Lokasi</th>
                    <th className="p-2 text-left">Foto</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((a) => (
                    <tr key={a.id} className="border-t hover:bg-gray-50 transition">
                      <td className="p-2 text-sm">
                        {new Date(a.created_at).toLocaleString('id-ID')}
                      </td>
                      <td className="p-2">{a.nama}</td>
                      <td className="p-2">{a.nim}</td>
                      <td className="p-2">{a.kelas}</td>
                      <td className="p-2">{a.mengikuti ? 'Ya' : 'Tidak'}</td>

                      {/* Lokasi */}
                      <td className="p-2 text-sm">
                        {a.lokasi_lat && a.lokasi_lng ? (
                          <div className="flex flex-col">
                            {a.lokasi_detail ? (
                              <span>{a.lokasi_detail}</span>
                            ) : (
                              <span>
                                {a.lokasi_lat.toFixed(5)}, {a.lokasi_lng.toFixed(5)}
                              </span>
                            )}
                            <a
                              href={`https://www.google.com/maps?q=${a.lokasi_lat},${a.lokasi_lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 text-xs hover:underline"
                            >
                              Lihat di Maps
                            </a>
                            {a.lokasi_accuracy && (
                              <span className="text-xs text-gray-500">
                                ±{Math.round(a.lokasi_accuracy)} m
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Tidak terdeteksi</span>
                        )}
                      </td>

                      {/* Foto */}
                      <td className="p-2">
                        {a.foto_url ? (
                          <a
                            href={a.foto_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Lihat foto"
                          >
                            <img
                              src={a.foto_url}
                              alt="foto"
                              className="w-24 h-16 object-cover rounded border"
                            />
                          </a>
                        ) : (
                          '-'
                        )}
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
