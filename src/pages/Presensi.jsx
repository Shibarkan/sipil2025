import React from 'react'
import AttendanceForm from '../components/Attendance'

export default function Presensi(){
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Form Presensi</h2>
      <AttendanceForm />
    </div>
  )
}
