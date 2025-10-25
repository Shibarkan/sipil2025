import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Presensi from './pages/Presensi'
import LihatPresensi from './pages/LihatPresensi'
import Kegiatan from './pages/Kegiatan'
import TambahKegiatan from './pages/TambahKegiatan'
import Login from './pages/Login'
import History from './pages/History'  // 🔥 Tambahan
import SplashScreen from './components/SplashScreen'
import { Toaster } from 'react-hot-toast'

export default function App() {
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'))
  const [showSplash, setShowSplash] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleLogin = (role) => {
    localStorage.setItem('userRole', role)
    setUserRole(role)
    navigate('/tambah')
  }

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    setUserRole(null)
  }

  return (
    <>
      <Toaster position="top-right" />
      <SplashScreen isVisible={showSplash} />

      <div className="min-h-screen bg-gray-50 p-6">
        <header className="max-w-5xl mx-auto flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Sistem Presensi Kegiatan</h1>

          <nav className="space-x-3 flex items-center">
            <Link to="/" className="px-3 py-1 bg-white rounded shadow hover:bg-gray-100">
              Presensi
            </Link>
            <Link to="/lihat" className="px-3 py-1 bg-white rounded shadow hover:bg-gray-100">
              Lihat Presensi
            </Link>
            <Link to="/kegiatan" className="px-3 py-1 bg-white rounded shadow hover:bg-gray-100">
              Kegiatan
            </Link>

            {/* 🔥 History baru */}
            <Link to="/history" className="px-3 py-1 bg-white rounded shadow hover:bg-gray-100">
              History
            </Link>

            <Link to="/tambah" className="px-3 py-1 bg-green-600 text-white rounded shadow hover:bg-green-700">
              Tambah Kegiatan
            </Link>

            {userRole === 'admin' && (
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-red-600 text-white rounded shadow hover:bg-red-700"
              >
                Logout
              </button>
            )}
          </nav>
        </header>

        <main className="max-w-5xl mx-auto bg-white p-4 rounded shadow">
          <Routes>
            <Route path="/" element={<Presensi />} />
            <Route path="/lihat" element={<LihatPresensi />} />
            <Route path="/kegiatan" element={<Kegiatan />} />
            <Route path="/history" element={<History />} /> {/* 🔥 Route baru */}
            <Route
              path="/tambah"
              element={
                userRole === 'admin' ? (
                  <TambahKegiatan />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              }
            />
          </Routes>
        </main>
      </div>
    </>
  )
}
