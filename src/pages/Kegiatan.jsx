import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'

export default function Kegiatan(){
  const [kegiatan, setKegiatan] = useState([])

  useEffect(()=>{ fetch() }, [])

  async function fetch(){
    const { data } = await supabase.from('kegiatan').select('*').order('tanggal', { ascending:false })
    setKegiatan(data || [])
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Daftar Kegiatan</h2>
      <Link to="/tambah" className="mb-4 inline-block bg-green-600 text-white px-3 py-1 rounded">Tambah Kegiatan</Link>
      <ul>
        {kegiatan.map(k => (
          <li key={k.id} className="border-b py-2 flex justify-between items-center">
            <div>
              <div className="font-medium">{k.nama}</div>
              <div className="text-sm text-gray-600">{new Date(k.tanggal).toLocaleDateString('id-ID')}</div>
            </div>
            <div className="text-sm">
              <Link className="underline" to={`/lihat?kegiatan=${k.id}`}>Lihat Presensi</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
