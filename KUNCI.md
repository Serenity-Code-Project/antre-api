# Kunci Jawaban antre-api

Baca kunci ini setelah kamu mencoba sendiri. Kunci menunjukkan satu jalan yang lolos pemeriksaan.
Jawabanmu boleh berbeda dan tetap benar, selama tanda selesainya terpenuhi.

## Latihan Memasang Scalar di Antre

Branch `answer/api-docs`, dibangun di atas `main`.

Tugasnya memasang `@scalar/hono-api-reference` dengan versi yang dikunci, menyajikan halaman
referensi di `/docs` dari spec yang sudah ada, membuktikan spec tidak berubah, lalu mencatat rute
baru itu di README.

### Yang Berubah

| File | Perubahan |
| --- | --- |
| `package.json` | `@scalar/hono-api-reference` ditulis dengan versi persis `0.12.19`, tanpa caret. |
| `bun.lock` | Ikut berubah karena `bun add`. Tidak diedit dengan tangan. |
| `src/app.ts` | Rute `GET /docs` tepat sesudah rute spec, didaftarkan dengan `app.get`, dengan skrip CDN yang dikunci. |
| `README.md` | Tabel rute mendapat `/openapi.json` dan `/docs`, plus satu kalimat tentang versi skrip CDN. |

`openapi.json` tidak berubah. Itu bagian dari bukti, bukan kelupaan.

### Cara Memeriksa

```sh
bun test            # 4 pass, 0 fail, sama dengan sebelum latihan
bun run type-check  # tidak mencetak kesalahan

cp openapi.json /tmp/openapi.before.json
bun run spec:export
cmp openapi.json /tmp/openapi.before.json && echo "spec unchanged"   # spec unchanged

PORT=4317 bun run src/index.ts &
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" http://localhost:4317/docs
# 200 text/html; charset=UTF-8
curl -s http://localhost:4317/docs | grep -o "<script[^>]*src=\"[^\"]*\""
# <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.78.0"
kill %1
```

### Yang Perlu Diperhatikan

- Rute `/docs` memakai `app.get`, bukan `app.openapi`. Halaman dokumentasi bukan bagian dari API,
  jadi ia tidak masuk ke spec, dan salinan spec di antre-web tidak perlu disinkronkan.
- Scalar membaca spec dari `/openapi.json` yang sudah ada. Tidak ada alamat kedua untuk dokumen
  yang sama.
- Tanpa opsi tambahan, halaman `/docs` memuat
  `https://cdn.jsdelivr.net/npm/@scalar/api-reference/esm.js` tanpa nomor versi. Paket di
  `package.json` terkunci, tetapi skrip yang dimuat browser bisa berubah kapan saja. Kunci ini
  memberi opsi `cdn` dengan versi `1.78.0`, rilis `@scalar/api-reference` yang terbit bersama
  `@scalar/hono-api-reference@0.12.19`. Halamannya sekarang memuat
  `https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.78.0`.
- Opsi `cdn` memakai bundel satu file, bukan build ESM bawaan. Bundel itu lebih besar, sekitar 5 MB,
  tetapi tidak berubah sampai kamu sendiri menaikkan versinya. Saat menaikkan versi paket, naikkan
  juga angka di URL itu.
- Tugas tambahan `DOCS_ENABLED` tidak dikerjakan di kunci ini. Kalau kamu menambahkannya, variabel
  itu harus tertulis di README dalam commit yang sama.
