# Kunci Jawaban antre-api

Baca kunci ini setelah kamu mencoba sendiri. Kunci menunjukkan satu jalan yang lolos pemeriksaan.
Jawabanmu boleh berbeda dan tetap benar, selama tanda selesainya terpenuhi.

Tiap branch kunci dibangun di atas branch sebelumnya, sama seperti repo milikmu yang bertambah dari
satu latihan ke latihan berikutnya.

## Latihan Satu Putaran Pertama

Branch `answer/health-service`.

Tugasnya menambah field `service` berisi `antre-api` ke jawaban `GET /health`.

### Yang Berubah

| File | Perubahan |
| --- | --- |
| `src/app.ts` | Skema jawaban `/health` mendapat `service`, dan handler mengisinya. |
| `src/queue.test.ts` | Satu tes baru yang memanggil `/health` dan memeriksa isi jawabannya. |
| `openapi.json` | Dibuat ulang dengan `bun run spec:export`. Tidak diedit dengan tangan. |

Tiga file, sesuai batas di perintah tugas. Kalau diff milikmu menyentuh file keempat, itu tanda
agen keluar dari batas.

### Cara Memeriksa

```sh
bun test            # 5 pass, 0 fail
bun run type-check  # tidak mencetak apa pun
git diff main --stat
```

### Yang Perlu Diperhatikan

- Skema dan handler berubah bersama. Kalau hanya handler yang diubah, `type-check` gagal karena
  jawaban tidak cocok dengan skema. Itu contoh pemeriksaan yang menangkap kesalahan sebelum kamu.
- Tes baru memeriksa isi jawaban dengan `toEqual`, bukan sekadar status 200. Tes yang hanya
  memeriksa status tetap lolos kalau field `service` salah isi.
- `openapi.json` berubah karena perintah ekspor, dan perubahannya ikut di-commit. Kontrak yang
  tertinggal dari kode adalah sumber bug antara antre-api dan antre-web.

## Latihan Satu Putaran AIM di Antre

Branch `answer/call-next`.

Tugasnya menulis spec untuk fitur memanggil nomor berikutnya, menyerahkannya ke agen dengan tugas
yang berbatas, lalu mengisi tabel bukti untuk tiap tanda selesai.

### Yang Berubah

| File | Perubahan |
| --- | --- |
| `SPEC.md` | Spec satu halaman dengan enam bagian. Baca ini lebih dulu. |
| `src/queue.ts` | Fungsi `callNext`, satu pernyataan SQL yang memilih dan menandai tiket. |
| `src/app.ts` | Rute `POST /call-next` dengan jawaban 200, 401, dan 409, serta pemeriksaan kunci. |
| `src/index.ts` | Membaca `STAFF_KEY` dari lingkungan dan meneruskannya ke aplikasi. |
| `src/queue.test.ts` | Sembilan tes baru, satu atau lebih untuk tiap tanda selesai. |
| `openapi.json` | Dibuat ulang. Sekarang memuat empat rute dan skema keamanan `staffKey`. |

### Tabel Bukti

| Tanda selesai | Bukti | Status |
| --- | --- | --- |
| 1. Tanpa kunci dijawab 401 | Tes `answers 401 without a staff key`, dan curl tanpa header | Terukur |
| 2. Kunci salah dijawab 401 | Tes `answers 401 with a wrong staff key` | Terukur |
| 3. Tanpa `STAFF_KEY` semua ditolak | Tes `answers 401 for every key when no staff key is configured` | Terukur |
| 4. Kunci benar memanggil nomor terkecil | Tes `calls the next number with the right key`, dan curl dengan header | Terukur |
| 5. Papan menampilkan nomor itu | Tes `calls the smallest waiting number and moves the board` | Terukur |
| 6. Antrean kosong dijawab 409 tanpa perubahan | Tes `answers 409 when nobody is waiting` dan `returns null and changes nothing` | Terukur |
| 7. Dua panggilan bersamaan tidak bentrok | Tes `two calls at the same moment get two different numbers` | Terukur di satu proses. Dua server yang memakai satu file database belum diukur |

Baris terakhir sengaja ditulis jujur. Tes membuktikan perilakunya di satu proses. Untuk dua proses,
alasannya masih berupa penalaran dari cara SQLite mengunci penulisan, belum pengukuran.

### Cara Memeriksa

```sh
bun test            # 14 pass, 0 fail
bun run type-check

STAFF_KEY=kunci-coba bun run dev
curl -i -X POST localhost:4000/call-next                               # 401
curl -X POST localhost:4000/tickets
curl -i -X POST -H "x-staff-key: kunci-coba" localhost:4000/call-next  # 200
```

### Yang Perlu Diperhatikan

- Kunci petugas tidak ada di kode. Tes memakai kunci buatan yang diberikan lewat parameter
  `createApp`, dan server membacanya dari `STAFF_KEY`. Kalau diff milikmu memuat kunci sebagai teks
  di `src/app.ts`, itu celah yang dibahas lagi di latihan review.
- Tanpa `STAFF_KEY`, rute menolak semua panggilan. Pilihan sebaliknya, yaitu membuka rute saat
  kunci lupa diatur, akan membuat kelalaian kecil menjadi celah.
- Kunci dibandingkan dengan `timingSafeEqual`, supaya lama waktu jawaban tidak membocorkan berapa
  huruf yang sudah benar.
- Pergantian hari tidak diperbaiki di sini. Spec menuliskannya di bagian yang sengaja tidak
  dikerjakan, lengkap dengan usulan. Itu berbeda dengan tidak sadar bahwa masalahnya ada.
