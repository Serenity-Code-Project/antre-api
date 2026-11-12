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

## Latihan Review Pull Request di Antre

Branch `answer/staff-stats`, dibangun di atas `review/staff-stats`, yaitu pull request yang direview.

Pull request itu lolos `bun test` dan type-check, tetapi tidak boleh digabung. Kunci ini memuat
tujuh finding yang benar beserta perbaikannya, lalu lima umpan beserta putusannya. Daftar finding-mu
boleh lebih panjang.

### Tujuh Finding yang Benar

| # | Finding | File dan Baris di Pull Request | Perbaikan | Bukti |
| --- | --- | --- | --- | --- |
| 1 | Staff key `antre-dev-key` tertulis di kode dan menjadi nilai bawaan saat `STAFF_KEY` kosong. Ia membuka `GET /stats` dan juga `POST /call-next` yang sudah ada | `src/app.ts:59`, `src/app.ts:105` | Konstanta dihapus, `staffKey` kembali opsional | Measured, curl di bawah |
| 2 | Papan berubah dari lima menjadi tiga nomor berikutnya, padahal spec melarang perubahan pada papan | `src/queue.ts:96` | `slice(0, 5)` dikembalikan | Measured, `/state` di bawah |
| 3 | `/stats` di `openapi.json` diketik dengan tangan, tanpa staff key dan tanpa jawaban 401 | `openapi.json:197` | Dibuat ulang dengan `bun run spec:export` | Measured, 46 baris berubah |
| 4 | Satu-satunya tes `readStats` yang berisi data hanya memeriksa `toBeTruthy()`, jadi done criteria 5 tanpa bukti | `src/queue.test.ts:15` | `toEqual` dengan angka yang dihitung sendiri | Measured, mutan di bawah |
| 5 | Tidak ada tes 401 untuk staff key salah dan untuk server tanpa `STAFF_KEY` | `src/queue.test.ts` | Tiga tes baru, termasuk staff key lama | Measured, 21 pass |
| 6 | Tes 200 hanya memeriksa status, tidak pernah isinya | `src/queue.test.ts:29` | Tes memeriksa isi jawaban | Measured, 21 pass |
| 7 | Komentar di `src/index.ts` masih benar di kode lama, tetapi salah di pull request | `src/index.ts:8` | Komentar menyebut kedua rute staff | Inferred, dibaca dari kode |

### Lima Umpan

| Sumber | Finding | Putusan | Alasan |
| --- | --- | --- | --- |
| AI review 1 | SQL dibangun dari string, jadi bisa disuntik lewat `day` | Salah | `src/queue.ts:112` memakai `?`, dan `day` dikirim sebagai parameter |
| AI review 2 | Kunci salah seharusnya 403, bukan 401 | Salah | Done criteria 1 sampai 3 meminta 401, sama dengan `POST /call-next` |
| AI review 3 | `sum(status = 'called')` bukan SQL yang sah | Salah | SQLite menjalankannya, dan tes `counts taken, called and waiting` menghitung 1 |
| AI review 4 | `dayOf` memotong hari dari UTC, jadi sebelum 07.00 WIB masih terhitung kemarin | Benar, tetapi Ditunda | Benar, dan sudah tertulis di bagian Not in this round. Perbaikannya mengubah semua rute |
| Reviewer 8 | Spec datang di pull request yang sama, jadi tidak direview terpisah | Salah | Di kelas ini spec memang ikut pull request fiturnya, seperti `SPEC.md` di `answer/call-next` |

AI review 5, yaitu `toBeTruthy()` yang lemah, adalah satu-satunya finding AI review yang benar dan
dikerjakan sekarang. Ia sama dengan finding 4.

### Cara Memeriksa

```sh
bun test            # 21 pass, 0 fail
bun run type-check  # tidak mencetak kesalahan

bun run dev         # tanpa STAFF_KEY
curl -i -H "x-staff-key: antre-dev-key" localhost:4000/stats            # HTTP/1.1 401 Unauthorized
curl -i -X POST -H "x-staff-key: antre-dev-key" localhost:4000/call-next # HTTP/1.1 401 Unauthorized
for i in 1 2 3 4 5; do curl -s -X POST localhost:4000/tickets > /dev/null; done
curl -s localhost:4000/state                                            # "next":[1,2,3,4,5]
```

Untuk finding 4, rusak kodenya lagi seperti di latihan. Ubah `waiting: taken - called` menjadi
`waiting: taken` di `src/queue.ts`, lalu jalankan `bun test`. Sekarang hasilnya 20 pass dan 1 fail,
dengan tes `counts taken, called and waiting` yang gagal. Kembalikan baris itu sesudahnya.

### Yang Perlu Diperhatikan

- Gate hijau hanya membuktikan hal yang diuji. Tes lama tidak menyentuh papan, jadi perubahan
  papan lolos. Tes baru `toBeTruthy()` tidak bisa gagal, jadi pengurangan yang hilang juga lolos.
- Finding 1 lebih berat daripada kelihatannya. Nilai bawaan itu juga membuka `POST /call-next`,
  rute yang aman sebelum pull request ini. Bukti measured-nya adalah jawaban 409, karena 409 berarti
  staff key diterima.
- Tiga umpan ditolak dengan menunjuk file dan baris. Menolak finding dengan bukti juga hasil review.
