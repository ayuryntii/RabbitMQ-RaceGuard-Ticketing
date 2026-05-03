/**
 * TUGAS #7: SISTEM PENJUALAN TIKET KONSER (CONCURRENCY CONTROL)
 * Topik: Simulasi Race Condition & Solusi RabbitMQ (Semaphore)
 * 
 * File ini berisi logic backend untuk simulasi pemesanan tiket.
 * Dibuat untuk memenuhi kriteria tugas sistem terdistribusi.
 */

const express = require('express');
const amqp = require('amqplib');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Konfigurasi Server & RabbitMQ
const PORT = 5000;
// Gunakan URL CloudAMQP yang diberikan di tugas
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqps://wxqrahue:ZE-htGBtObIlKlGabk5JGEbZQotduowH@fuji.lmq.cloudamqp.com/wxqrahue';
const QUEUE_NAME = 'antrean_tiket';

// Global Variable untuk simulasi
let sisa_tiket = 100;
let log_transaksi = [];
let sedang_proses = false;
let waktu_mulai = 0;
let waktu_selesai = 0;

// --- ROUTE UTAMA ---

app.get('/', (req, res) => {
    res.send('<h1 style="font-family: sans-serif; text-align: center; margin-top: 50px;">🚀 Backend Simulator Tugas 7 Aktif</h1>');
});

// Reset simulasi ke kondisi awal
app.post('/reset', (req, res) => {
    sisa_tiket = 100;
    log_transaksi = [];
    sedang_proses = false;
    res.json({ status: 'OK', sisa_tiket });
});

// Ambil status terbaru untuk di-update ke dashboard frontend
app.get('/status', (req, res) => {
    res.json({
        sisa_tiket,
        logs: log_transaksi,
        isProcessing: sedang_proses,
        timeTaken: waktu_selesai - waktu_mulai
    });
});

// --- TAHAP 1: SIMULASI GAGAL (RACE CONDITION) ---

app.post('/simulate/unsafe', async(req, res) => {
    const { requestsCount } = req.body;
    sisa_tiket = 100;
    log_transaksi = [];
    waktu_mulai = Date.now();

    // Jalankan banyak request secara bersamaan (konkuren)
    const antrean_request = [];
    for (let i = 0; i < requestsCount; i++) {
        antrean_request.push(prosesTiketTanpaLock(i + 1));
    }

    await Promise.all(antrean_request);
    waktu_selesai = Date.now();

    res.json({ message: 'Simulasi Unsafe Selesai', sisa_tiket });
});

async function prosesTiketTanpaLock(id) {
    // Simulasi delay jaringan/proses agar race condition lebih mudah terlihat
    await new Promise(r => setTimeout(r, Math.random() * 10));

    if (sisa_tiket > 0) {
        // --- CRITICAL SECTION (TANPA PROTEKSI) ---
        // Di sini terjadi pembacaan nilai global secara bersamaan
        const current_stok = sisa_tiket;
        await new Promise(r => setTimeout(r, 5)); // Simulasi jeda tulis
        sisa_tiket = current_stok - 1;

        log_transaksi.push({ id, status: 'SUCCESS', remaining: sisa_tiket });
    } else {
        log_transaksi.push({ id, status: 'FAILED', message: 'Tiket Habis' });
    }
}

// --- TAHAP 2: SOLUSI MUTUAL EXCLUSION (RABBITMQ) ---

app.post('/simulate/safe', async(req, res) => {
    const { requestsCount } = req.body;
    sisa_tiket = 100;
    log_transaksi = [];
    waktu_mulai = Date.now();
    sedang_proses = true;

    try {
        const koneksi = await amqp.connect(RABBITMQ_URL);
        const channel = await koneksi.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: false });

        // Kosongkan antrean lama jika ada
        await channel.purgeQueue(QUEUE_NAME);

        // Produser: Masukkan semua request ke antrean RabbitMQ
        for (let i = 0; i < requestsCount; i++) {
            const data = JSON.stringify({ id: i + 1 });
            channel.sendToQueue(QUEUE_NAME, Buffer.from(data));
        }

        res.json({ message: 'Simulasi Safe Dimulai via RabbitMQ' });

        // Jalankan worker untuk memproses satu per satu
        jalankanWorker(koneksi, requestsCount);

    } catch (err) {
        console.error('RabbitMQ Error:', err);
        res.status(500).json({ error: 'Gagal koneksi ke RabbitMQ' });
    }
});

async function jalankanWorker(koneksi, total_req) {
    const channel = await koneksi.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: false });

    // PENTING: prefetch(1) memastikan worker hanya ambil 1 pesan dalam satu waktu
    // Ini adalah implementasi praktis dari Binary Semaphore
    await channel.prefetch(1);

    let diproses = 0;

    channel.consume(QUEUE_NAME, async(msg) => {
        if (msg !== null) {
            const content = JSON.parse(msg.content.toString());

            // --- CRITICAL SECTION (TERPROTEKSI ANTREAN) ---
            if (sisa_tiket > 0) {
                await new Promise(r => setTimeout(r, 5));
                sisa_tiket -= 1;
                log_transaksi.push({ id: content.id, status: 'SUCCESS', remaining: sisa_tiket });
            } else {
                log_transaksi.push({ id: content.id, status: 'FAILED', message: 'Tiket Habis' });
            }

            channel.ack(msg);
            diproses++;

            // Selesai jika semua request sudah masuk log
            if (diproses >= total_req) {
                waktu_selesai = Date.now();
                sedang_proses = false;
                // Tutup koneksi agar tidak leak
                setTimeout(() => {
                    channel.close();
                    koneksi.close();
                }, 500);
            }
        }
    });
}

app.listen(PORT, () => {
    console.log(`[SERVER] Berjalan di http://localhost:${PORT}`);
});



def proses_pemesanan(user_id):