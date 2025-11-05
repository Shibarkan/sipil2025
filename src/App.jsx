import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Presensi from './pages/Presensi'
import LihatPresensi from './pages/LihatPresensi'
import Kegiatan from './pages/Kegiatan'
import TambahKegiatan from './pages/TambahKegiatan'
import Login from './pages/Login'
import History from './pages/History'
import SplashScreen from './components/SplashScreen'
import { Toaster } from 'react-hot-toast'
import { Menu, X } from 'lucide-react'

export default function App() {
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'))
  const [showSplash, setShowSplash] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
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
    navigate('/')
  }

  const NavLink = ({ to, label }) => (
    <Link
      to={to}
      className="block px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-gray-100 rounded-md transition"
      onClick={() => setMenuOpen(false)}
    >
      {label}
    </Link>
  )

  return (
    <>
      <Toaster position="top-right" />
      <SplashScreen isVisible={showSplash} />

      <div className="min-h-screen bg-gray-50">
        {/* ✅ Navbar */}
        <header className="bg-white shadow-sm fixed top-0 left-0 w-full z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="text-lg sm:text-2xl font-bold text-green-700">
              Presensi Kegiatan
            </h1>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-3 items-center">
              <NavLink to="/" label="Presensi" />
              <NavLink to="/lihat" label="Lihat Presensi" />
              <NavLink to="/kegiatan" label="Kegiatan" />
              <NavLink to="/history" label="History" />
              <NavLink to="/tambah" label="Tambah Kegiatan" />

              {userRole === 'admin' && (
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                >
                  Logout
                </button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-md"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Mobile Dropdown */}
          {menuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200 shadow-sm">
              <NavLink to="/" label="Presensi" />
              <NavLink to="/lihat" label="Lihat Presensi" />
              <NavLink to="/kegiatan" label="Kegiatan" />
              <NavLink to="/history" label="History" />
              <NavLink to="/tambah" label="Tambah Kegiatan" />
              {userRole === 'admin' && (
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              )}
            </div>
          )}
        </header>

        {/* ✅ Content */}
        <main className="max-w-6xl mx-auto px-4 pt-24 pb-10">
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <Routes>
              <Route path="/" element={<Presensi />} />
              <Route path="/lihat" element={<LihatPresensi />} />
              <Route path="/kegiatan" element={<Kegiatan />} />
              <Route path="/history" element={<History />} />
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
          </div>
        </main>
      </div>
    </>
  )
}
