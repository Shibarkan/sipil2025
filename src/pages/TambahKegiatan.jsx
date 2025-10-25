import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function TambahKegiatan() {
  const [form, setForm] = useState({ nama: '', tanggal: '' })
  const [role, setRole] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole')
    if (!storedRole) {
      toast.error('Silakan login terlebih dahulu.')
      navigate('/login')
    } else {
      setRole(storedRole)
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (role !== 'admin') {
      toast.error('Anda tidak memiliki izin untuk menambah kegiatan!')
      return
    }

    const { error } = await supabase.from('kegiatan').insert([
      {
        nama: form.nama,
        tanggal: form.tanggal,
      },
    ])

    if (error) {
      console.error(error)
      toast.error('Gagal menambah kegiatan.')
    } else {
      toast.success('✅ Kegiatan berhasil ditambahkan!')
      setForm({ nama: '', tanggal: '' })
      navigate('/')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    toast.success('Logout berhasil.')
    navigate('/')
  }

  if (role !== 'admin') {
    return (
      <div className="p-6 text-center text-red-500">
        Anda tidak memiliki izin untuk menambah kegiatan.
        <br />
        <button
          onClick={handleLogout}
          className="mt-3 underline text-sm text-gray-600"
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-lg font-semibold mb-4">Tambah Kegiatan</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Nama Kegiatan"
          value={form.nama}
          onChange={(e) => setForm({ ...form, nama: e.target.value })}
          className="border p-2 w-full rounded"
          required
        />
        <input
          type="date"
          value={form.tanggal}
          onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
          className="border p-2 w-full rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-2 rounded"
        >
          Simpan
        </button>
      </form>

      <button
        onClick={handleLogout}
        className="text-red-500 text-sm mt-4 underline"
      >
        Logout
      </button>
    </div>
  )
}
