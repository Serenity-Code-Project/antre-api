# Guardrail antre-api

Catatan ini contoh hasil Latihan Cari Celah dan Pasang Guardrail di Antre. Isinya tiga bagian,
yaitu celah yang ditemukan, penolakan yang terbukti, dan hal yang tidak dicegah.

## Celah yang Ditemukan

Diperiksa pada branch `main`, November 2026.

| Yang diperiksa | Temuan | Penjaga sebelum | Penjaga sesudah |
| --- | --- | --- | --- |
| File permission | Tidak ada folder `.claude` | Belum ada | Permission, `.claude/settings.json` |
| Hook | Tidak ada | Belum ada | Hook, `.claude/hooks/guard.ts` |
| Probe | Tidak ada | Belum ada | 16 probe dua arah, `bun run check:guard` |
| File env | `.gitignore` mengabaikan file env, tetapi file contohnya tidak ada | Sebagian | Permission, hook, dan `.env.example` |
| Branch main | Tidak ada yang menghentikan push ke `main` | Belum ada | Permission dan hook. Aturan di server Git belum ada |
| Catatan guardrail | Tidak ada | Belum ada | File ini |
| Aturan produk | `POST /tickets` tidak punya batas per pengunjung | Belum ada | Belum ada, dicatat di bawah |

## Penolakan yang Terbukti

Probe dijalankan dengan Bun 1.4.4 pada 11 November 2026.

```text
16 probes, 0 failed
```

Saat aturan `--no-verify` dihapus dari hook untuk sementara, hasilnya berubah menjadi berikut.
Itu bukti bahwa probe menjaga aturan tersebut.

```text
FAIL  block  git commit --no-verify -m "quick"   (got allow)

16 probes, 1 failed
```

| Uji di sesi agen | Hasil | Siapa yang menolak | Status |
| --- | --- | --- | --- |
| `rm -rf try-delete` | Ditolak, folder tetap utuh | Hook, dengan pesan `[guard] BLOCKED: recursive delete.` | Terukur lewat probe. Di sesi sungguhan pernah dijalankan dengan versi hook sebelum pesannya diterjemahkan |
| Menampilkan isi `.env` | Ditolak | Aturan deny kalau agen memakai tool baca, hook kalau memakai terminal | Terukur lewat probe saja. Belum dijalankan di sesi sungguhan |
| `git push origin main` | Ditolak sebelum ada yang dikirim | Hook, dan aturan deny untuk bentuk persis ini | Terukur lewat probe saja. Belum dijalankan di sesi sungguhan |

Dua baris terakhir sengaja ditulis apa adanya. Di catatanmu sendiri, isi kolom ini dengan bunyi
pesan yang kamu lihat, tanggalnya, dan versi agenmu.

## Yang Tidak Dicegah

| Hal | Sebabnya | Sikap |
| --- | --- | --- |
| Skrip yang ditulis lalu dijalankan | Hook membaca teks perintah, bukan isi file yang dijalankan perintah itu | Diterima untuk repo latihan. Di repo produk, tambah sandbox dan review diff |
| `git push` dari branch `main` tanpa menyebut namanya | Pola hook mencari kata `main` di perintah | Diterima sementara. Penjaga yang tepat adalah aturan branch di server Git |
| Seratus nomor dari satu pengunjung | `POST /tickets` tidak punya batas. Ini aturan produk, bukan guardrail agen | Dicatat sebagai risiko. Perbaikannya butuh spec dan tes sendiri |
| Tool selain Bash | Hook hanya tersambung ke Bash. Tool edit dan baca dijaga daftar permission saja | Diterima. Daftar deny memuat file env |
| Hook yang dimatikan | Siapa pun yang boleh mengedit `.claude` bisa melepas sambungannya. Aturan ask hanya meminta izin | Diterima. Perubahan pada `.claude` dibaca di tiap review |
