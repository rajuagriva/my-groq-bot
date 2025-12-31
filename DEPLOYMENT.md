# Panduan Deployment ke Vercel dengan Database

Aplikasi ini sekarang menggunakan Hybrid Storage:
- **Local Development**: Menyimpan data di file JSON (`data/token-usage.json`)
- **Vercel Production**: Menggunakan Vercel Postgres

## Langkah-langkah Deployment

1. **Push code ke repository Git** (GitHub/GitLab).

2. **Import project ke Vercel**.

3. **Setup Database di Vercel Dashboard**:
   - Buka project di Vercel.
   - Pergi ke tab **Storage**.
   - Klik **Connect Store** -> Pilih **Postgres** -> **Create New**.
   - Beri nama database (bebas), pilih region (Singapore `sin1` disarankan untuk Indonesia).
   - Tunggu proses pembuatan selesai.
   - Setelah selesai, klik **Connect Project** jika belum otomatis terhubung.
   - Vercel akan otomatis menambahkan environment variable `POSTGRES_URL`, dll.

4. **Jangan Lupa Environment Variable API Key**:
   - Pastikan `GROQ_API_KEY` juga sudah ditambahkan di **Settings > Environment Variables**.

5. **Deploy Project**:
   - Lakukan deployment (jika belum otomatis berjalan).

6. **Inisialisasi Tabel Database**:
   - Setelah website live (misal: `https://my-groq-bot.vercel.app`), Anda perlu membuat tabel database sekali saja.
   - Buka browser dan akses URL: 
     `https://<nama-domain-anda>.vercel.app/api/admin/init-db`
   - Jika sukses, akan muncul pesan JSON: `{"status":"success", "message":...}`

7. **Selesai!**
   - Halaman admin sekarang bisa diakses di `/admin` dan data akan tersimpan permanen di database.
