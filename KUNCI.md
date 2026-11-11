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

## Latihan Buru Mutan di Antre

Branch `answer/hunt-mutant`.

Tugasnya memutasi satu baris dengan tangan, menjalankan Stryker pada `src/queue.ts`, lalu menulis
tes yang membunuh mutan yang selamat.

### Angka yang Terukur

Angkamu bergantung pada isi repo saat kamu mengukur. Tabel ini diukur pada branch kunci, yaitu
setelah fitur memanggil nomor dari latihan Satu Putaran AIM masuk.

| Saat | Mutan | Terbunuh | Selamat | Skor mutasi | Line coverage `queue.ts` |
| --- | --- | --- | --- | --- | --- |
| Starter di `main` | 25 | 18 | 7 | 72,00% | 100% |
| Sebelum latihan, di atas kunci latihan Satu Putaran AIM | 27 | 21 | 6 | 77,78% | 100% |
| Sesudah latihan | 27 | 22 | 5 | 81,48% | 100% |

Coverage sudah 100% sejak awal dan tidak berubah. Skor mutasi yang bergerak. Itu inti latihannya.

### Yang Berubah

| File | Perubahan |
| --- | --- |
| `src/queue.test.ts` | Tes pertama sekarang memeriksa nomor, hari, dan status. Satu tes baru untuk batas lima nomor. |
| `stryker.config.json` | Pengaturan Stryker dengan command runner `bun test`. |
| `package.json`, `bun.lock` | `@stryker-mutator/core` sebagai dev dependency. |
| `.gitignore` | Folder kerja dan laporan Stryker. |

`src/queue.ts` tidak disentuh. Di latihan ini yang diperbaiki adalah tes, bukan kode.

### Mutan yang Terbunuh

- **Batas lima nomor.** Mutannya mengganti `waiting.slice(0, 5).map(...)` menjadi
  `waiting.map(...)`. Tidak ada tes dengan lebih dari lima orang menunggu, jadi mutan itu selamat.
  Tes baru mengambil tujuh nomor dan memeriksa bahwa `next` berisi lima dan `waiting` tetap tujuh.
- **Nomor yang sedang dipanggil.** Di starter, mutan pada `current?.n ?? null` selamat karena tidak
  ada tes dengan nomor yang sudah dipanggil. Tes `callNext` dari latihan Satu Putaran AIM sudah membunuhnya. Fitur
  baru yang datang dengan tesnya ikut menaikkan skor.

Tes pertama yang semula hanya `toBeTruthy` juga diperbaiki. Perbaikan itu tidak membunuh mutan
baru, karena tes lain sudah memeriksa nomornya. Ia tetap diperbaiki supaya tiap tes berdiri
sendiri. Tes yang lolos untuk nilai apa pun tidak menjaga apa pun.

### Mutan yang Sengaja Dibiarkan

| Mutan | Keputusan |
| --- | --- |
| `openQueue(path = "")` | Dibiarkan. SQLite memperlakukan nama kosong sebagai database sementara, jadi perilakunya sama untuk tes |
| `(last.n ?? 0) + 1` tanpa `?.` | Dibiarkan. Query `max()` selalu mengembalikan satu baris, jadi `last` tidak pernah kosong |
| `current.n ?? null` tanpa `?.` | Dibiarkan, dengan alasan yang sama |
| `if (false) throw ...` | Dibiarkan. Cabang itu hanya berjalan kalau database gagal menyimpan, dan itu tidak bisa dipicu dari tes tanpa memalsukan database |
| Pesan error dikosongkan | Dibiarkan. Tidak ada yang bergantung pada isi pesannya |

Skor 100% bukan tujuannya. Yang diminta adalah satu kalimat keputusan untuk tiap mutan yang
selamat, seperti tabel di atas.

### Cara Memeriksa

```sh
bun test             # 15 pass, 0 fail
bun test --coverage  # src/queue.ts 100% line
bunx stryker run     # 27 mutan, 22 terbunuh, 5 selamat, 81,48%
```
