# Laporan Teknis Tugas #7: Simulasi Race Condition & Solusi Mutual Exclusion

## 1. Pendahuluan
Laporan ini mendokumentasikan implementasi sistem pemesanan tiket konser yang menangani ribuan permintaan konkuren. Fokus utama adalah demonstrasi kondisi gagal (Race Condition) dan penyelesaiannya menggunakan mekanisme Antrean Pesan (RabbitMQ) sebagai implementasi praktis dari Binary Semaphore.

## 2. Alur Kerja Algoritma
### Tahap 1: Pemodelan Kondisi Gagal (Race Condition)
Pada tahap ini, aplikasi memproses permintaan secara paralel tanpa sinkronisasi.
- **Proses**: Setiap request membaca variabel `sisa_tiket`, melakukan jeda singkat (delay), lalu mengurangi nilai tersebut.
- **Masalah**: Karena beberapa thread/proses membaca nilai yang sama sebelum thread lain sempat menulis (update), terjadi inkonsistensi data (Overbooked).

### Tahap 2: Implementasi Solusi Mutual Exclusion (RabbitMQ)
Menggunakan RabbitMQ untuk mengatur antrean pemrosesan.
- **Proses**: Setiap request dimasukkan ke dalam queue.
- **Sinkronisasi**: Worker dikonfigurasi dengan `prefetch_count=1`. Ini memastikan hanya satu pesan yang diproses oleh satu worker pada satu waktu.
- **Semaphore**: Mekanisme ini bertindak sebagai Binary Semaphore, di mana kunci (lock) diberikan kepada worker yang sedang memproses, dan pesan berikutnya hanya akan dikirim setelah "Signal/Ack" diberikan.

## 3. Identifikasi Critical Section
Bagian kode yang merupakan **Critical Section** adalah saat aplikasi melakukan operasi Baca-Modifikasi-Tulis pada variabel `sisa_tiket`:
```javascript
// Critical Section
if (sisa_tiket > 0) {
    sisa_tiket = sisa_tiket - 1;
}
```
Tanpa pengamanan, dua proses dapat masuk ke blok `if` secara bersamaan saat `sisa_tiket` bernilai 1, menyebabkan keduanya mengurangi nilai tersebut menjadi 0 dan -1.

## 4. Analisis Performa
- **Sistem Tanpa Pengaman**: Sangat cepat karena tidak ada koordinasi, namun data rusak.
- **Sistem Dengan RabbitMQ**: Mengalami sedikit penurunan kecepatan (*overhead*) karena adanya proses *marshaling* data ke queue dan komunikasi jaringan dengan server RabbitMQ.
- **Kesimpulan**: Meskipun ada *overhead*, integritas data jauh lebih krusial. Dalam sistem finansial atau ticketing, kehilangan konsistensi data jauh lebih mahal daripada tambahan waktu beberapa milidetik.

## 5. Hasil Pengujian (Dokumentasi)
| Parameter | Unsafe (Race Condition) | Safe (RabbitMQ) |
|-----------|-------------------------|-----------------|
| Requests  | 500                     | 500             |
| Stok Awal | 100                     | 100             |
| Stok Akhir| < 0 (Misal: -15)        | Tepat 0         |
| Status    | GAGAL (Data Corrupt)    | BERHASIL        |

---

