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
