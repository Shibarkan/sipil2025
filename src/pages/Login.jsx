import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()

    if (username === 'admin' && password === '123') {
      localStorage.setItem('userRole', 'admin')
      onLogin('admin')
      navigate('/tambah-kegiatan')
    } else if (username === 'mahasiswa' && password === '123') {
      localStorage.setItem('userRole', 'mahasiswa')
      onLogin('mahasiswa')
      navigate('/')
    } else {
      setError('❌ Username atau password salah!')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-lg shadow-lg w-80"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Login Presensi</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border w-full p-2 rounded mb-3"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border w-full p-2 rounded mb-3"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
        <p className="text-xs text-gray-500 mt-3">
          admin: <b>admin / 123</b> <br />
          mahasiswa: <b>mahasiswa / 123</b>
        </p>
      </form>
    </div>
  )
}
