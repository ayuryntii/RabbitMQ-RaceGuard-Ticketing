# KONTEN PRESENTASI PPT (TUGAS #7)

Silakan salin poin-poin berikut ke dalam slide PowerPoint Anda.

---

## Slide 1: Judul
**Judul**: Simulasi Concurrency Control pada Sistem Penjualan Tiket Konser
**Sub-judul**: Analisis Race Condition & Solusi Mutual Exclusion menggunakan RabbitMQ
**Disusun Oleh**: [Nama Anda]
**Topik**: Tugas #7 - Sistem Terdistribusi / Pemrograman Lanjut

---

## Slide 2: Problem Statement (Kasus)
*   **Skenario**: Platform e-commerce penjualan tiket konser dengan trafik tinggi (High Concurrency).
*   **Masalah**: Ribuan penggemar mencoba membeli tiket dalam waktu yang bersamaan.
*   **Risiko**: Tanpa sinkronisasi, terjadi **Race Condition** di mana tiket terjual melebihi stok yang tersedia (Overbooked).
*   **Tujuan**: Mensimulasikan masalah tersebut dan menyelesaikannya dengan konsep **Mutual Exclusion**.

---

## Slide 3: Apa itu Race Condition?
*   Kondisi di mana beberapa proses membaca dan menulis data yang sama secara bersamaan.
*   **Contoh di Kode**:
    1.  User A baca stok (Stok = 1).
    2.  User B baca stok (Stok = 1).
    3.  User A kurangi stok (Stok jadi 0).
    4.  User B kurangi stok (Stok jadi -1).
*   **Akibat**: Inkonsistensi data serius pada sistem transaksi.

---

## Slide 4: Solusi: RabbitMQ sebagai Semaphore
*   **Metode**: Menggunakan Message Queue untuk mengatur urutan permintaan.
*   **Konsep**: 
    *   **Queueing**: Mengubah request konkuren menjadi antrean sekuensial (berurutan).
    *   **Binary Semaphore**: Menggunakan fitur `prefetch_count=1`.
*   **Fungsi**: Memastikan hanya ada 1 worker yang memproses 1 pesanan dalam satu waktu (Locking mechanism).

---

## Slide 5: Arsitektur Sistem
*   **Frontend**: React.js Dashboard (Monitoring real-time).
*   **Backend**: Node.js API (Simulasi logika bisnis).
*   **Message Broker**: CloudAMQP (RabbitMQ) sebagai pengatur antrean.
*   **Workflow**:
    *   Requests -> RabbitMQ Queue -> Worker (Sequential) -> Update Database/Global Variable.

---

## Slide 6: Analisis Critical Section
*   **Critical Section** adalah bagian kode yang mengakses variabel global `sisa_tiket`.
*   **Identifikasi Kode**:
    ```javascript
    if (sisa_tiket > 0) {
        sisa_tiket = sisa_tiket - 1;
    }
    ```
*   Bagian ini harus dilindungi agar tidak diakses oleh dua proses secara bersamaan.

---

## Slide 7: Hasil Pengujian & Performa
*   **Tahap 1 (Unsafe)**: 
    *   Hasil: Stok menjadi negatif / tidak akurat.
    *   Kecepatan: Sangat cepat (tanpa hambatan), tapi data rusak.
*   **Tahap 2 (RabbitMQ)**:
    *   Hasil: Stok tepat berhenti di 0.
    *   Kecepatan: Sedikit lebih lambat (*overhead* jaringan), tapi data 100% konsisten.
*   **Kesimpulan**: Integritas data lebih penting daripada kecepatan milidetik dalam sistem ticketing.

---

## Slide 8: Demo & Kesimpulan
*   [Tunjukkan Screenshot Dashboard]
*   Mekanisme antrean (Queueing) efektif sebagai implementasi Semaphore untuk menjaga konsistensi data pada sistem terdistribusi yang padat trafik.
*   **Terima Kasih!**
