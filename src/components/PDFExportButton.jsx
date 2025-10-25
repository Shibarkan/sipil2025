import React from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { supabase } from '../lib/supabase'

export default function PDFExportButton() {
  const handleExport = async () => {
    try {
      const { data: attendances, error } = await supabase
        .from('presensi')
        .select('*')
        .order('kelas', { ascending: true })
        .order('nama', { ascending: true })

      if (error) throw error
      if (!attendances?.length) {
        alert('Belum ada data presensi.')
        return
      }

      // 📄 Pakai orientasi landscape agar tabel lebih muat
      const doc = new jsPDF('l', 'mm', 'a4')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.text('Rekap Presensi Semua Kelas', 14, 20)

      // ✅ Tambahkan kolom "Asal"
      const head = [
        ['Waktu', 'Nama', 'NIM', 'Kelas', 'Asal', 'Mengikuti', 'Lokasi', 'Foto'],
      ]

      const body = await Promise.all(
        attendances.map(async (a) => {
          let imgData = null
          if (a.foto_url) {
            try {
              const res = await fetch(a.foto_url)
              const blob = await res.blob()
              imgData = await blobToBase64(blob)
            } catch (err) {
              console.warn('Gagal ambil foto:', err)
            }
          }

          let lokasiText = '-'
          if (a.lokasi_lat && a.lokasi_lng) {
            const lat = a.lokasi_lat.toFixed(5)
            const lng = a.lokasi_lng.toFixed(5)
            lokasiText = a.lokasi_detail
              ? `${a.lokasi_detail}\n(${lat}, ${lng})`
              : `${lat}, ${lng}`
          }

          return [
            new Date(a.created_at).toLocaleString('id-ID'),
            a.nama,
            a.nim,
            a.kelas,
            a.asal || '-',
            a.mengikuti ? 'Ya' : 'Tidak',
            lokasiText,
            imgData || null,
          ]
        })
      )

      autoTable(doc, {
        head,
        body: body.map((r) => r.slice(0, -1)),
        startY: 30,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 3,
          overflow: 'linebreak',
          valign: 'middle',
        },
        headStyles: {
          fillColor: [22, 130, 204],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
        },
        columnStyles: {
          6: { cellWidth: 60 }, // Lokasi
          7: { cellWidth: 35, minCellHeight: 25 }, // Foto
        },
        didDrawCell: (data) => {
          if (
            data.section === 'body' &&
            data.column.index === 7 &&
            body[data.row.index][7]
          ) {
            const img = body[data.row.index][7]
            const cellWidth = data.cell.width
            const cellHeight = data.cell.height
            const padding = 2
            const maxImgWidth = cellWidth - padding * 2
            const maxImgHeight = cellHeight - padding * 2
            const aspectRatio = 4 / 3

            let imgWidth = maxImgWidth
            let imgHeight = imgWidth / aspectRatio
            if (imgHeight > maxImgHeight) {
              imgHeight = maxImgHeight
              imgWidth = imgHeight * aspectRatio
            }

            const x = data.cell.x + (cellWidth - imgWidth) / 2
            const y = data.cell.y + (cellHeight - imgHeight) / 2
            doc.addImage(img, 'JPEG', x, y, imgWidth, imgHeight)
          }
        },
      })

      // 🔹 Tambahkan footer: waktu cetak & nomor halaman
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(9)
        doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 14, 200)
        doc.text(`Hal ${i}/${pageCount}`, 285, 200, { align: 'right' })
      }

      doc.save(`rekap-presensi-semua-${Date.now()}.pdf`)
    } catch (err) {
      console.error(err)
      alert('Gagal membuat PDF.')
    }
  }

  const blobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })

  return (
    <button
      onClick={handleExport}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
    >
      📄 Download PDF Semua Kelas
    </button>
  )
}
