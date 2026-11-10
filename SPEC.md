# Spec, Memanggil Nomor Berikutnya

## Tujuan

Petugas klinik bisa memanggil nomor berikutnya, sehingga papan antrean bergerak. Pengunjung melihat
nomor yang sedang dipanggil tanpa bertanya ke petugas.

## Batas

Dikerjakan di putaran ini.

- Satu rute baru di antre-api, `POST /call-next`.
- Satu fungsi `callNext` di `src/queue.ts`, dengan tesnya.
- `openapi.json` dibuat ulang dengan `bun run spec:export`.

Sengaja tidak dikerjakan di putaran ini.

- Panel petugas di antre-web. Rute ini dicoba dengan curl dulu.
- Memanggil ulang nomor yang terlewat.
- Pergantian hari menurut jam Jakarta. `dayOf` masih memotong tanggal dari waktu UTC, jadi sampai
  pukul 07.00 WIB antrean masih dihitung sebagai hari kemarin. Ini dicatat sebagai pertanyaan
  terbuka, bukan diperbaiki diam-diam di tengah fitur lain.

## Tanda Selesai

1. `POST /call-next` tanpa header `x-staff-key` menjawab 401.
2. Dengan kunci yang salah, jawabannya 401.
3. Kalau `STAFF_KEY` tidak diatur di server, semua panggilan dijawab 401.
4. Dengan kunci yang benar, nomor menunggu terkecil hari itu berubah menjadi `called`, dan
   jawabannya 200 berisi tiket itu.
5. Setelah itu `GET /state` menampilkan nomor tersebut di `current`.
6. Saat tidak ada yang menunggu, jawabannya 409 dan tidak ada data yang berubah.
7. Dua panggilan pada saat yang sama tidak pernah mendapat nomor yang sama.

## Kasus Tepi

| Keadaan | Perilaku |
| --- | --- |
| Antrean kosong | 409, tidak ada baris yang berubah |
| Semua nomor sudah dipanggil | 409, sama seperti antrean kosong |
| Nomor hari kemarin masih menunggu | Tidak dipanggil. Hanya nomor hari ini yang dihitung |
| Kunci dikirim dengan panjang berbeda | 401, tanpa membandingkan isinya |

## Keputusan

Kunci petugas dibaca dari variabel lingkungan `STAFF_KEY` dan dikirim lewat header `x-staff-key`.
Kunci tidak pernah ditulis di kode, di tes produksi, atau di `openapi.json`.

Pilihan yang ditolak adalah akun petugas dengan kata sandi. Itu butuh tabel pengguna, sesi, dan
halaman masuk, sedangkan klinik kecil hanya punya satu meja petugas. Satu kunci bersama cukup untuk
putaran ini, dan rutenya bisa diganti ke akun nanti tanpa mengubah papan.

Memilih dan menandai tiket dilakukan dalam satu pernyataan SQL. Dengan begitu dua petugas yang
menekan tombol bersamaan tidak bisa mendapat nomor yang sama, tanpa perlu kunci tambahan di kode.

## Pertanyaan Terbuka

| Pertanyaan | Usulan |
| --- | --- |
| Kapan hitungan nomor kembali ke satu? | Tengah malam waktu Jakarta. Dikerjakan di putaran tersendiri, dengan tes pukul 06.30 WIB |
| Bolehkah nomor yang terlewat dipanggil ulang? | Belum. Tambahkan setelah ada panel petugas |
| Perlukah batas jumlah nomor per pengunjung? | Ya, tetapi itu aturan produk tersendiri dan bukan bagian fitur ini |
