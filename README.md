# Perpustakaan API

## 1. Deskripsi Umum dan Tujuan Proyek

REST API pencatatan peminjaman buku perpustakaan menggunakan Node.js, Express, dan Supabase dengan pola model-controller-router.

Tujuan: menyediakan CRUD buku, anggota, dan peminjaman oleh anggota, filter query.

## 2. Struktur Data / Schema

Tabel `loans` terhubung ke `books` dan `members` melalui `book_id` dan `member_id`.

**books**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | default gen_random_uuid() |
| judul | text | wajib |
| penulis | text | - |
| penerbit | text | - |
| tahun_terbit | integer | - |
| stok | integer | default 0 |
| created_at | timestamptz | default now() |

**members**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | default gen_random_uuid() |
| nama | text | wajib |
| email | text | - |
| phone | text | - |
| address | text | - |
| created_at | timestamptz | default now() |

**loans**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | default gen_random_uuid() |
| book_id | uuid FK | wajib, references books(id) on delete restrict |
| member_id | uuid FK | wajib, references members(id) on delete restrict |
| tanggal_pinjam | date | default current_date |
| tanggal_kembali | date | nullable |
| tanggal_jatuh_tempo | date | nullable |
| status | text | Dipinjam, Dikembalikan, Terlambat. default Dipinjam |
| created_at | timestamptz | default now() |

Filter `?status=Terlambat` ikut menampilkan pinjaman `Dipinjam` yang lewat tanggal jatuh tempo. Buku atau anggota yang masih memiliki data peminjaman tidak dapat dihapus.

Daftar endpoint:

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/` | Healthcheck |
| GET | `/api/books` | List buku |
| GET | `/api/books/:id` | Detail buku |
| POST | `/api/books` | Tambah buku |
| PUT | `/api/books/:id` | Ubah buku |
| DELETE | `/api/books/:id` | Hapus buku |
| GET | `/api/members` | List anggota |
| GET | `/api/members/:id` | Detail anggota |
| POST | `/api/members` | Tambah anggota |
| PUT | `/api/members/:id` | Ubah anggota |
| DELETE | `/api/members/:id` | Hapus anggota |
| GET | `/api/loans` | List peminjaman, dukung filter `?status=`, `?member_id=`, `?book_id=` |
| GET | `/api/loans?status=Dipinjam` | Contoh filter status |
| GET | `/api/loans?status=Terlambat` | Contoh filter terlambat |
| GET | `/api/loans?member_id=ID_ANGGOTA` | Contoh filter anggota |
| GET | `/api/loans?book_id=ID_BUKU` | Contoh filter buku |
| GET | `/api/loans/:id` | Detail + join buku dan anggota |
| POST | `/api/loans` | Tambah peminjaman |
| PUT | `/api/loans/:id` | Ubah peminjaman |
| DELETE | `/api/loans/:id` | Hapus peminjaman |

Alias tanpa prefix juga tersedia: `/loans`, `/loans?status=Terlambat`.

## 3. Contoh Request dan Response

Buat anggota: `POST /api/members`

Pada Postman dapat diuji dengan menggunakan Body Raw JSON:

```json
{
  "nama": "Budi Santoso",
  "email": "budi@email.com",
  "phone": "08123456789",
  "address": "Jl. Merdeka No. 10, Jakarta"
}
```

Response `201`:

```json
{
  "id": "a99b9ccf-18ba-4d80-a26a-71397bc608e1",
  "nama": "Budi Santoso",
  "email": "budi@email.com",
  "phone": "08123456789",
  "address": "Jl. Merdeka No. 10, Jakarta"
}
```

Buat buku: `POST /api/books`

Pada Postman dapat diuji dengan menggunakan Body Raw JSON:

```json
{
  "judul": "Laskar Pelangi",
  "penulis": "Andrea Hirata",
  "stok": 10
}
```

Response `201`:

```json
{
  "id": "uuid-buku",
  "judul": "Laskar Pelangi",
  "penulis": "Andrea Hirata",
  "stok": 10
}
```

Buat peminjaman: `POST /api/loans`

Pada Postman dapat diuji dengan menggunakan Body Raw JSON:

```json
{
  "book_id": "ID_BUKU_VALID",
  "member_id": "ID_ANGGOTA_VALID",
  "tanggal_pinjam": "2026-10-01",
  "tanggal_jatuh_tempo": "2026-10-08",
  "status": "Dipinjam"
}
```

Response `201`:

```json
{
  "id": "uuid-loan",
  "book_id": "ID_BUKU_VALID",
  "member_id": "ID_ANGGOTA_VALID",
  "tanggal_pinjam": "2026-10-01",
  "tanggal_jatuh_tempo": "2026-10-08",
  "status": "Dipinjam"
}
```

Filter terlambat: `GET /api/loans?status=Terlambat`

Response `200`:

```json
[
  {
    "id": "uuid-loan",
    "book_id": "ID_BUKU_VALID",
    "member_id": "ID_ANGGOTA_VALID",
    "tanggal_pinjam": "2026-09-01",
    "status": "Terlambat"
  }
]
```

Variasi lain: `?status=Dipinjam`, `?member_id=ID_ANGGOTA_VALID`, `?book_id=ID_BUKU_VALID`, atau gabungan `?status=Dipinjam&member_id=ID_ANGGOTA_VALID`.

Ubah status: `PUT /api/loans/:id`

Pada Postman dapat diuji dengan menggunakan Body Raw JSON:

```json
{
  "status": "Dikembalikan",
  "tanggal_kembali": "2026-10-07"
}
```

Hapus: `DELETE /api/loans/:id`

Response `200`:

```json
{
  "message": "Loan deleted successfully"
}
```

Contoh error (status tidak valid): `GET /api/loans?status=Salah`

Response `400`:

```json
{
  "error": "status harus salah satu dari: Dipinjam, Dikembalikan, Terlambat"
}
```

## 4. Panduan Instalasi dan Cara Menjalankan Lokal

1. Clone repo dan install:

```bash
git clone https://github.com/rfibyzan/perpus-api-responsi-modul-1-ppb.git
cd perpus-api-responsi-modul-1-ppb
code .
```

2. Jalankan kode berikut pada terminal Visual Studio Code:

```bash
npm install
cp .env.example .env
```

3. Buat project di Supabase, buka SQL Editor, jalankan kode berikut :

```sql
create table books (
  id uuid primary key default gen_random_uuid(),
  judul text not null,
  penulis text,
  penerbit text,
  tahun_terbit integer,
  stok integer default 0,
  created_at timestamptz default now()
);

create table members (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  email text,
  phone text,
  address text,
  created_at timestamptz default now()
);

create table loans (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references books(id) on delete restrict,
  member_id uuid not null references members(id) on delete restrict,
  tanggal_pinjam date not null default current_date,
  tanggal_kembali date,
  tanggal_jatuh_tempo date,
  status text not null default 'Dipinjam' check (status in ('Dipinjam', 'Dikembalikan', 'Terlambat')),
  created_at timestamptz default now()
);

```

Jika Row Level Security aktif di tabel tanpa policy, anon key hanya dapat respons kosong atau insert ditolak. Untuk tugas ini nonaktifkan RLS atau tambah policy baca tulis untuk peran anon.

4. Ambil Project URL dan anon public key dari Project Settings > Data API / API Keys.

5. Isi `.env`:

```
SUPABASE_URL=https:(ISI PROJECT URL)
SUPABASE_KEY=(ISI ANON PUBLIC KEY)
PORT=3000
```

6. Jalankan:

```bash
npm run dev
```

Buka `http://localhost:3000`.

## 5. Link Hasil Deployment Vercel

https://perpus-api-responsi-modul-1-ppb.vercel.app/