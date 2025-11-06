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
  const [loading, setLoading] = useState(false);
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

  // 🔹 Ambil lokasi secara akurat (GPS)
  function getLocation() {
    if (!navigator.geolocation) {
      toast.error("Browser tidak mendukung deteksi lokasi GPS.");
      return;
    }

    toast.loading("Mendeteksi lokasi perangkat...", { id: "loc" });

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        setLocation({
          lat: latitude,
          lng: longitude,
          accuracy: accuracy,
          detail: null,
        });

        toast.success(`Lokasi ditemukan (akurasi ±${Math.round(accuracy)} m)`, {
          id: "loc",
        });

        try {
          // Reverse geocoding: ubah koordinat ke nama kota
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=id`
          );
          const data = await res.json();
          if (data && (data.city || data.locality)) {
            setLocation((prev) => ({
              ...prev,
              detail: `${data.city || ""}, ${data.locality || ""}`.trim(),
            }));
          }
        } catch {
          console.warn("Gagal mendapatkan nama lokasi.");
        }
      },
      (err) => {
        toast.error("Gagal mendeteksi lokasi: " + err.message, { id: "loc" });
      },
      {
        enableHighAccuracy: true, // GPS akurat
        timeout: 20000,
        maximumAge: 0,
      }
    );

    // stop watch setelah beberapa detik biar gak makan baterai
    setTimeout(() => {
      navigator.geolocation.clearWatch(watchId);
    }, 20000);
  }

  // 🔹 Kirim presensi
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.kegiatan_id) return toast.error("Pilih kegiatan terlebih dahulu");
    if (loading) return;

    setLoading(true);
    toast.loading("Mengirim presensi...", { id: "submit" });

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

      // Cek apakah sudah presensi
      const { data: existing } = await supabase
        .from("presensi")
        .select("id")
        .eq("nim", form.nim)
        .eq("kegiatan_id", form.kegiatan_id)
        .maybeSingle();

      if (existing) {
        toast.error("Kamu sudah presensi untuk kegiatan ini!", { id: "submit" });
        setLoading(false);
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

      toast.success("✅ Presensi berhasil dikirim!", { id: "submit" });

      setTimeout(() => {
        navigate(`/lihat?kegiatan=${form.kegiatan_id}&kelas=${form.kelas}`);
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error("Gagal kirim presensi. Coba lagi.", { id: "submit" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto p-4">
      <div>
        <label className="block text-sm font-medium">Kegiatan</label>
        <select
          required
          value={form.kegiatan_id}
          onChange={(e) => setForm({ ...form, kegiatan_id: e.target.value })}
          className="w-full border p-2 rounded mt-1"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

      {/* Info lokasi yang terdeteksi */}
      <div className="border rounded p-3 bg-gray-50 text-sm">
        <p className="font-medium mb-1">📍 Lokasi Terdeteksi:</p>
        {location.lat ? (
          <div>
            <p>Latitude: {location.lat.toFixed(6)}</p>
            <p>Longitude: {location.lng.toFixed(6)}</p>
            <p>
              Akurasi: ±
              <span className="font-semibold">
                {Math.round(location.accuracy)} m
              </span>
            </p>
            <p>Detail: {location.detail || "-"}</p>
          </div>
        ) : (
          <p className="text-gray-500 italic">Mendeteksi lokasi...</p>
        )}
      </div>

      {/* Upload foto */}
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
              className="w-full max-w-[300px] h-auto object-cover rounded-lg border shadow-sm"
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`px-6 py-2 rounded text-white w-full sm:w-auto transition ${
          loading
            ? "bg-gray-400 cursor-not-allowed animate-pulse"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "⏳ Mengirim..." : "Kirim Presensi"}
      </button>
    </form>
  );
}
