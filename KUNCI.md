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
| `src/app.ts` | Rute `GET /docs` tepat sesudah rute spec, didaftarkan dengan `app.get`. |
| `README.md` | Tabel rute mendapat `/openapi.json` dan `/docs`, plus satu kalimat tentang skrip dari CDN. |

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
kill %1
```

### Yang Perlu Diperhatikan

- Rute `/docs` memakai `app.get`, bukan `app.openapi`. Halaman dokumentasi bukan bagian dari API,
  jadi ia tidak masuk ke spec, dan salinan spec di antre-web tidak perlu disinkronkan.
- Scalar membaca spec dari `/openapi.json` yang sudah ada. Tidak ada alamat kedua untuk dokumen
  yang sama.
- Paketnya terkunci di `package.json`, tetapi halaman `/docs` memuat
  `https://cdn.jsdelivr.net/npm/@scalar/api-reference/esm.js` tanpa nomor versi. Tampilannya bisa
  berubah walaupun repo ini tidak berubah, dan README menuliskan itu.
- Tugas tambahan `DOCS_ENABLED` tidak dikerjakan di kunci ini. Kalau kamu menambahkannya, variabel
  itu harus tertulis di README dalam commit yang sama.
