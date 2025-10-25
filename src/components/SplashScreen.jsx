import React from 'react'
export default function SplashScreen({ isVisible }){
  if(!isVisible) return null
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="text-center">
        <div className="text-2xl font-bold">Memuat...</div>
      </div>
    </div>
  )
}
