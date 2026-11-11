# Kunci Jawaban antre-api

Baca kunci ini setelah kamu mencoba sendiri. Kunci menunjukkan satu jalan yang lolos pemeriksaan.
Jawabanmu boleh berbeda dan tetap benar, selama tanda selesainya terpenuhi.

Tiap branch kunci dibangun di atas branch sebelumnya, sama seperti repo milikmu yang bertambah dari
satu latihan ke latihan berikutnya.

## Latihan Satu Putaran Pertama

Branch `kunci/health-service`.

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

Branch `kunci/call-next`.

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

## Latihan Cari Celah dan Pasang Guardrail di Antre

Branch `kunci/guardrails`, dibangun di atas `kunci/call-next`.

Tugasnya mencari celah guardrail di antre-api, memasang tiga daftar izin dan satu hook, lalu
membuktikan penolakannya dari dua arah. Kode aplikasi di folder `src` tidak berubah.

### Yang Berubah

| File | Perubahan |
| --- | --- |
| `.claude/settings.json` | Daftar allow, ask, dan deny, serta sambungan hook untuk tool Bash. |
| `.claude/hooks/guard.ts` | Hook 26 baris dengan lima aturan. Tool call yang tidak terbaca ikut ditolak. |
| `scripts/check/guard-probes.tsv` | Enam belas probe, sembilan harus ditolak dan tujuh harus lolos. |
| `scripts/check/guard-probes.ts` | Mengirim tiap probe ke hook lewat stdin dan menilai exit code-nya. |
| `package.json` | Script `check:guard`. |
| `.env.example` | Tiga nama variabel dengan nilai bawaannya. Tidak ada yang rahasia. |
| `GUARDRAILS.md` | Tujuh celah, penolakan yang terbukti, dan hal yang tidak dicegah. |

### Cara Memeriksa

```sh
bun run check:guard   # 16 probes, 0 failed
bun test              # 14 pass, 0 fail
bun run type-check
git diff origin/kunci/call-next origin/kunci/guardrails --stat
```

Perintah terakhir tidak boleh menampilkan file di dalam `src`.

### Yang Perlu Diperhatikan

- Probe menguji dua arah. Sembilan baris `block` membuktikan hook menolak. Tujuh baris `allow`
  membuktikan hook tidak menghalangi pekerjaan sah, misalnya `cat .env.example` dan
  `git log --oneline main`.
- Pola push ke branch utama memakai `[\s:](main|master)`, supaya `git push origin HEAD:main`
  ikut ditolak. Pola yang hanya mencari spasi sebelum `main` meloloskannya.
- Pola hapus rekursif mencari huruf `r` dan `f` di flag mana pun, jadi `rm -fr` dan `rm -r -f`
  ikut tertangkap. Aturan deny berbentuk awalan hanya mengenali `rm -rf`.
- Skrip probe diakhiri `export {}`. Tanpa baris itu `bun run type-check` gagal, karena `await` di
  tingkat atas hanya boleh ada di file modul.
- `GUARDRAILS.md` menulis dua penolakan sebagai terukur lewat probe saja. Itu contoh menulis batas
  bukti dengan jujur, dan catatanmu sendiri seharusnya memuat hasil dari sesi sungguhan.
