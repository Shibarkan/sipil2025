import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

export default function AttendanceForm() {
  const [kegiatan, setKegiatan] = useState([]);
  const [form, setForm] = useState({
    nama: "",
    nim: "",
    kelas: "A",
    asal: "",
    mengikuti: "true",
    kegiatan_id: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    detail: null,
    accuracy: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchKegiatan();
    getLocation();
  }, []);

  async function fetchKegiatan() {
    const { data, error } = await supabase
      .from("kegiatan")
      .select("*")
      .order("tanggal", { ascending: false });
    if (!error) setKegiatan(data);
  }

  // 🔹 Dapatkan lokasi perangkat secara akurat
  function getLocation() {
    if (!navigator.geolocation) {
      toast.error("Browser Anda tidak mendukung deteksi lokasi.");
      return;
    }

    toast.loading("Mendeteksi lokasi perangkat...", { id: "loc" });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setLocation({
          lat: latitude,
          lng: longitude,
          detail: null,
          accuracy: accuracy,
        });

        toast.success(`Lokasi ditemukan (akurasi ±${Math.round(accuracy)} m)`, {
          id: "loc",
        });

        // Reverse geocoding untuk mendapatkan nama lokasi
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=id`
          );
          const data = await res.json();
          if (data && data.city) {
            setLocation((prev) => ({
              ...prev,
              detail: `${data.city || ""}, ${data.locality || ""}`.trim(),
            }));
          }
        } catch (e) {
          console.warn("Gagal mendapatkan nama lokasi.");
        }
      },
      (err) => {
        toast.error("Gagal mendeteksi lokasi: " + err.message, { id: "loc" });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  // 🔹 Kirim presensi
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.kegiatan_id) return toast.error("Pilih kegiatan terlebih dahulu");

    try {
      let foto_url = null;

      // Upload foto ke Supabase Storage
      if (file) {
        const ext = file.name.split(".").pop();
        const fileName = `${form.nim}_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("presensi-photos")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("presensi-photos")
          .getPublicUrl(fileName);

        foto_url = data.publicUrl;
      }
      // 🔹 Cek apakah sudah presensi untuk kegiatan ini
      const { data: existing } = await supabase
        .from("presensi")
        .select("id")
        .eq("nim", form.nim)
        .eq("kegiatan_id", form.kegiatan_id)
        .maybeSingle();

      if (existing) {
        toast.error("Kamu sudah presensi untuk kegiatan ini!");
        return;
      }

      // Simpan ke database
      const { error } = await supabase.from("presensi").insert([
        {
          kegiatan_id: form.kegiatan_id,
          nama: form.nama,
          nim: form.nim,
          kelas: form.kelas,
          asal: form.asal,
          mengikuti: form.mengikuti === "true",
          foto_url,
          lokasi_lat: location.lat,
          lokasi_lng: location.lng,
          lokasi_detail: location.detail,
          lokasi_accuracy: location.accuracy,
        },
      ]);
      if (error) throw error;

      toast.success(
        <div>
          ✅ Presensi berhasil dikirim!
          <br />
          <a
            onClick={() =>
              navigate(
                `/lihat?kegiatan=${form.kegiatan_id}&kelas=${form.kelas}`
              )
            }
            className="underline cursor-pointer"
          >
            Lihat presensi kegiatan ini
          </a>
        </div>
      );

      // Reset form
      setForm({
        nama: "",
        nim: "",
        kelas: "A",
        asal: "",
        mengikuti: "true",
        kegiatan_id: "",
      });
      setFile(null);
      setPreview(null);
    } catch (err) {
      console.error(err);
      toast.error("Gagal kirim presensi. Coba lagi.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Pilih kegiatan */}
      <div>
        <label className="block text-sm">Kegiatan</label>
        <select
          required
          value={form.kegiatan_id}
          onChange={(e) => setForm({ ...form, kegiatan_id: e.target.value })}
          className="w-full border p-2 rounded"
        >
          <option value="">-- Pilih Kegiatan --</option>
          {kegiatan.map((k) => (
            <option key={k.id} value={k.id}>
              {k.nama} — {dayjs(k.tanggal).format("DD MMM YYYY")}
            </option>
          ))}
        </select>
      </div>

      {/* Data diri */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          required
          placeholder="Nama"
          value={form.nama}
          onChange={(e) => setForm({ ...form, nama: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          required
          placeholder="NIM"
          value={form.nim}
          onChange={(e) => setForm({ ...form, nim: e.target.value })}
          className="border p-2 rounded"
        />
      </div>

      {/* Kelas & asal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <select
          value={form.kelas}
          onChange={(e) => setForm({ ...form, kelas: e.target.value })}
          className="border p-2 rounded"
        >
          <option>A</option>
          <option>B</option>
          <option>C</option>
          <option>D</option>
          <option>IUP</option>
        </select>
        <input
          placeholder="Asal"
          value={form.asal}
          onChange={(e) => setForm({ ...form, asal: e.target.value })}
          className="border p-2 rounded"
        />
      </div>

      {/* Mengikuti kegiatan */}
      <div>
        <label className="block text-sm">Mengikuti kegiatan?</label>
        <div className="flex gap-4 mt-1">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="mengikuti"
              value="true"
              checked={form.mengikuti === "true"}
              onChange={(e) => setForm({ ...form, mengikuti: e.target.value })}
            />
            &nbsp;Ya
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="mengikuti"
              value="false"
              checked={form.mengikuti === "false"}
              onChange={(e) => setForm({ ...form, mengikuti: e.target.value })}
            />
            &nbsp;Tidak
          </label>
        </div>
      </div>

      {/* Lokasi otomatis */}
      <div className="bg-gray-50 border p-3 rounded text-sm">
        <p>📍 Lokasi otomatis:</p>
        {location.lat ? (
          <>
            <p>
              {location.detail
                ? location.detail
                : `Lat: ${location.lat.toFixed(5)}, Lng: ${location.lng.toFixed(
                    5
                  )}`}
            </p>
            {location.accuracy && (
              <p className="text-xs text-gray-500">
                Akurasi ±{Math.round(location.accuracy)} meter
              </p>
            )}
          </>
        ) : (
          <p className="text-gray-400">Mendeteksi lokasi...</p>
        )}
      </div>

      {/* Upload foto dengan preview */}
      <div className="border p-3 rounded bg-gray-50">
        <label className="block text-sm font-medium mb-2">
          Upload Foto Kehadiran
        </label>

        <div className="flex items-center gap-3">
          <label
            htmlFor="fotoUpload"
            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            📸 Pilih Foto
          </label>
          <input
            id="fotoUpload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setFile(file);
                const reader = new FileReader();
                reader.onload = (ev) => {
                  setPreview(ev.target.result);
                };
                reader.readAsDataURL(file);
              }
            }}
          />

          {file && (
            <span className="text-sm text-gray-600 truncate max-w-[150px]">
              {file.name}
            </span>
          )}
        </div>

        {preview && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-1">Pratinjau Foto:</p>
            <img
              src={preview}
              alt="preview"
              className="w-40 h-28 object-cover rounded-lg border shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Tombol kirim */}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Kirim Presensi
      </button>
    </form>
  );
}
