# Kunci Jawaban antre-api

Baca kunci ini setelah kamu mencoba sendiri. Kunci menunjukkan satu jalan yang lolos pemeriksaan.
Jawabanmu boleh berbeda dan tetap benar, selama tanda selesainya terpenuhi.

## Latihan Request Id dan Uptime Check di Antre

Branch `answer/request-id`, dibangun di atas `main`.

Kunci ini hanya mencakup Bagian Satu, yaitu request id dan log di laptop. Bagian Dua, uptime check
dari luar, berjalan di server dan layanan monitor milikmu, jadi tidak ada kodenya di repo ini.

### Yang Berubah

| File | Perubahan |
| --- | --- |
| `src/app.test.ts` | File tes baru. Tiga tes request id dan satu tes baris log, ditulis lebih dulu dan gagal dulu. |
| `src/app.ts` | Middleware bawaan Hono `requestId`, lalu satu middleware yang menulis satu baris JSON per permintaan. |
| `README.md` | Satu paragraf tentang header `X-Request-Id` dan baris log. |

Tidak ada dependency baru. `requestId` sudah ada di Hono 4.13.17 sebagai `hono/request-id`.
`openapi.json` tidak berubah, karena middleware bukan rute.

### Cara Memeriksa

```sh
bun test            # sebelum src/app.ts diubah: 4 pass, 4 fail
bun test            # sesudahnya: 8 pass, 0 fail
bun run type-check  # tidak mencetak kesalahan

PORT=4317 bun run src/index.ts > antre.log &
curl -si http://localhost:4317/health | grep -i x-request-id
# X-Request-Id: 308cb38e-9b71-49ad-ae9d-7faae736a1be   (id milikmu berbeda)
curl -si -H 'X-Request-Id: test-123' http://localhost:4317/health | grep -i x-request-id
# X-Request-Id: test-123
curl -s -H 'X-Request-Id: find-me' http://localhost:4317/state > /dev/null
grep find-me antre.log
# {"requestId":"find-me","method":"GET","path":"/state","status":200,"ms":0}
kill %1 && rm antre.log
```

### Yang Perlu Diperhatikan

- Middleware `requestId` dipasang paling awal, sebelum CORS dan sebelum log, supaya semua yang
  datang sesudahnya bisa membaca id yang sama lewat `c.get('requestId')`.
- Id dari klien dipakai ulang. Hono membatasinya sendiri: paling panjang 255 karakter, dan hanya
  huruf, angka, `_`, `-` dan `=`. Id lain diganti dengan UUID baru.
- Baris log ditulis sesudah `await next()`, karena status jawaban baru diketahui setelah handler
  selesai.
- Log tidak memuat body dan tidak memuat header lain. Kebiasaan itu melindungi produkmu begitu ia
  mulai menyimpan data pribadi.
- Tes log mengganti `console.log` dengan `spyOn` lalu mengembalikannya sesudah tes, supaya keluaran
  tes lain tidak ikut tertangkap.
