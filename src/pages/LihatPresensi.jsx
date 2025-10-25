import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AttendanceList from '../components/AttendanceList'
import PDFExportButton from '../components/PDFExportButton'
import { useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'

export default function LihatPresensi(){
  const [searchParams] = useSearchParams()
  const [kegiatan, setKegiatan] = useState([])
  const [selectedKegiatan, setSelectedKegiatan] = useState(searchParams.get('kegiatan') || '')
  const [kelas, setKelas] = useState(searchParams.get('kelas') || 'A')
  const [filterRange, setFilterRange] = useState('this_week')
  const [attendances, setAttendances] = useState([])

  useEffect(()=> { fetchKegiatan() }, [])
  useEffect(()=> { if (selectedKegiatan) fetchAttendances() }, [selectedKegiatan, kelas, filterRange])

  async function fetchKegiatan(){
    const { data } = await supabase.from('kegiatan').select('*').order('tanggal', { ascending: false })
    setKegiatan(data || [])
  }

  function getRangeDates(){
    const today = dayjs()
    if (filterRange === 'this_week') return [today.subtract(6, 'day').startOf('day').toISOString(), today.endOf('day').toISOString()]
    if (filterRange === 'last_week') return [today.subtract(13, 'day').startOf('day').toISOString(), today.subtract(7, 'day').endOf('day').toISOString()]
    return [null, null]
  }

  async function fetchAttendances(){
    const [from, to] = getRangeDates()
    let q = supabase.from('presensi').select('*, kegiatan:kegiatan_id(*)').eq('kegiatan_id', selectedKegiatan).eq('kelas', kelas).order('created_at', {ascending:false})
    if (from && to) q = q.gte('created_at', from).lte('created_at', to)
    const { data } = await q
    setAttendances(data || [])
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Lihat Presensi</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <select value={selectedKegiatan} onChange={e=>setSelectedKegiatan(e.target.value)} className="border p-2 rounded">
          <option value="">-- Pilih kegiatan --</option>
          {kegiatan.map(k => <option key={k.id} value={k.id}>{k.nama} — {dayjs(k.tanggal).format('DD MMM')}</option>)}
        </select>

        <select value={kelas} onChange={e=>setKelas(e.target.value)} className="border p-2 rounded">
          <option>A</option><option>B</option><option>C</option><option>D</option><option>IUP</option>
        </select>

        <select value={filterRange} onChange={e=>setFilterRange(e.target.value)} className="border p-2 rounded">
          <option value="this_week">Minggu ini</option>
          <option value="last_week">Minggu lalu</option>
        </select>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm text-gray-600">Total absen: {attendances.length}</p>
        </div>
        <div className="flex gap-2">
          <PDFExportButton attendances={attendances} filterDate={filterRange}/>
        </div>
      </div>

      <AttendanceList attendances={attendances} />
    </div>
  )
}
