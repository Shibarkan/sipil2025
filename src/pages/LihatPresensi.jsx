import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AttendanceList from '../components/AttendanceList'
import PDFExportButton from '../components/PDFExportButton'
import { useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'

export default function LihatPresensi() {
  const [searchParams] = useSearchParams()
  const [kegiatan, setKegiatan] = useState([])
  const [selectedKegiatan, setSelectedKegiatan] = useState(searchParams.get('kegiatan') || '')
  const [kelas, setKelas] = useState(searchParams.get('kelas') || 'A')
  const [filterRange, setFilterRange] = useState('this_week')
  const [attendances, setAttendances] = useState([])
  const [loading, setLoading] = useState(false)

  // 🔹 Ambil daftar kegiatan
  useEffect(() => { fetchKegiatan() }, [])
  // 🔹 Ambil presensi saat filter berubah
  useEffect(() => {
    if (selectedKegiatan) fetchAttendances()
  }, [selectedKegiatan, kelas, filterRange])

  // ==============================
  // 1️⃣ Ambil data kegiatan
  // ==============================
  async function fetchKegiatan() {
    const { data, error } = await supabase
      .from('kegiatan')
      .select('*')
      .order('tanggal', { ascending: false })
    if (!error) setKegiatan(data || [])
  }

  // ==============================
  // 2️⃣ Hitung tanggal rentang filter
  // ==============================
  function getRangeDates() {
    const today = dayjs()
    if (filterRange === 'this_week')
      return [today.subtract(6, 'day').startOf('day').toISOString(), today.endOf('day').toISOString()]
    if (filterRange === 'last_week')
      return [today.subtract(13, 'day').startOf('day').toISOString(), today.subtract(7, 'day').endOf('day').toISOString()]
    return [null, null]
  }

  // ==============================
  // 3️⃣ Ambil data presensi
  // ==============================
  async function fetchAttendances() {
    if (!selectedKegiatan) return
    setLoading(true)
    const [from, to] = getRangeDates()
    let q = supabase
      .from('presensi')
      .select('*, kegiatan:kegiatan_id(*)')
      .eq('kegiatan_id', selectedKegiatan)
      .eq('kelas', kelas)
      .order('created_at', { ascending: false })

    if (from && to) q = q.gte('created_at', from).lte('created_at', to)
    const { data, error } = await q
    if (!error) setAttendances(data || [])
    setLoading(false)
  }

  // ==============================
  // 4️⃣ Hapus data presensi
  // ==============================
  async function handleDelete(id, fotoPath) {
    const result = await Swal.fire({
      title: 'Hapus presensi?',
      text: 'Data ini akan dihapus permanen.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    })

    if (!result.isConfirmed) return

    const { error } = await supabase.from('presensi').delete().eq('id', id)
    if (error) {
      Swal.fire('Gagal!', 'Tidak dapat menghapus data.', 'error')
      return
    }

    // 🔹 Hapus foto dari storage (jika ada)
    if (fotoPath && !fotoPath.startsWith('http')) {
      await supabase.storage.from('presensi').remove([fotoPath])
    }

    // 🔹 Update tampilan setelah hapus
    setAttendances(attendances.filter((a) => a.id !== id))

    Swal.fire('Berhasil!', 'Presensi telah dihapus.', 'success')
  }

  // ==============================
  // 5️⃣ Tampilan halaman
  // ==============================
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Lihat Presensi</h2>

      {/* FILTER BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {/* Pilih kegiatan */}
        <select
          value={selectedKegiatan}
          onChange={e => setSelectedKegiatan(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">-- Pilih kegiatan --</option>
          {kegiatan.map(k => (
            <option key={k.id} value={k.id}>
              {k.nama} — {dayjs(k.tanggal).format('DD MMM')}
            </option>
          ))}
        </select>

        {/* Pilih kelas */}
        <select
          value={kelas}
          onChange={e => setKelas(e.target.value)}
          className="border p-2 rounded"
        >
          <option>A</option>
          <option>B</option>
          <option>C</option>
          <option>D</option>
          <option>IUP</option>
        </select>

        {/* Pilih rentang tanggal */}
        <select
          value={filterRange}
          onChange={e => setFilterRange(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="this_week">Minggu ini</option>
          <option value="last_week">Minggu lalu</option>
        </select>
      </div>

      {/* HEADER & TOMBOL PDF */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-600">Total absen: {attendances.length}</p>
        <PDFExportButton attendances={attendances} filterDate={filterRange} />
      </div>

      {/* LIST PRESENSI */}
      {loading ? (
        <p className="text-gray-500 italic">Memuat data...</p>
      ) : !selectedKegiatan ? (
        <p className="text-gray-500 italic">Silakan pilih kegiatan terlebih dahulu.</p>
      ) : attendances.length === 0 ? (
        <p className="text-gray-500 italic">Belum ada data presensi untuk filter ini.</p>
      ) : (
        <AttendanceList attendances={attendances} onDelete={handleDelete} />
      )}
    </div>
  )
}
