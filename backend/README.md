---
title: Capstone API
emoji: 🚀
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
---

# Django Capstone API - Hugging Face Deployment

REST API dengan Django, JWT Authentication, dan dokumentasi Swagger/ReDoc.

## 🌐 Live API Documentation

Setelah deploy, akses API documentation di:

- **Swagger UI**: `https://[your-username]-[space-name].hf.space/api/docs/`
- **ReDoc**: `https://[your-username]-[space-name].hf.space/api/redoc/`

## � Deploy ke Hugging Face

### 1. Persiapan Repository

Pastikan file-file ini sudah ada di repository:

```
django-capstone-project/
├── Dockerfile          # Sudah dikonfigurasi untuk Hugging Face
├── README.md            # File ini
├── requirements.txt     # Dependencies
├── capstone/           # Project settings
├── users/              # User app
└── core/               # Core utilities
```

### 2. Environment Variables di Hugging Face

Di **Settings** → **Repository secrets** atau **Space secrets**, tambahkan:

| Variable               | Value                                      | Keterangan                   |
| ---------------------- | ------------------------------------------ | ---------------------------- |
| `SECRET_KEY`           | `your-django-secret-key`                   | Django secret key            |
| `DEBUG`                | `False`                                    | Production mode              |
| `JWT_SECRET_KEY`       | `your-jwt-secret-key`                      | JWT signing key              |
| `DB_NAME`              | `postgres`                                 | Database name                |
| `DB_USER`              | `postgres.wtuvrsjxcgfihoyhowal`            | Supabase user                |
| `DB_PASSWORD`          | `your-password`                            | Supabase password            |
| `DB_HOST`              | `aws-1-ap-southeast-1.pooler.supabase.com` | Supabase host                |
| `DB_PORT`              | `6543`                                     | Supabase port                |
| `DB_SSLMODE`           | `require`                                  | SSL mode                     |
| `ACCESS_TOKEN_EXPIRY`  | `60`                                       | Access token expiry (detik)  |
| `REFRESH_TOKEN_EXPIRY` | `604800`                                   | Refresh token expiry (detik) |

### 3. Deploy Steps

1. **Buat Space baru** di Hugging Face:
   - Pilih **Docker** sebagai SDK
   - Repository name: `capstone-api` (atau yang Anda inginkan)

2. **Upload/Push code** ke repository Hugging Face:

   ```bash
   git clone https://huggingface.co/spaces/[username]/[space-name]
   cd [space-name]
   # Copy semua file project ke sini
   git add .
   git commit -m "Initial deployment"
   git push
   ```

3. **Atau gunakan GitHub integration**:
   - Hubungkan GitHub repository ke Hugging Face Space
   - Enable auto-deploy on push

### 4. Verifikasi Deployment

Setelah deploy berhasil:

1. Buka Space URL: `https://[username]-[space-name].hf.space/`
2. Cek API docs: `/api/docs/`
3. Test endpoint dengan Swagger UI

## 🔧 API Endpoints

### Authentication

| Method | Endpoint                  | Auth | Description             |
| ------ | ------------------------- | ---- | ----------------------- |
| `POST` | `/api/auth/register`      | -    | Register user baru      |
| `POST` | `/api/auth/login`         | -    | Login & dapatkan tokens |
| `POST` | `/api/auth/refresh-token` | -    | Refresh access token    |

### User

| Method | Endpoint  | Auth   | Description           |
| ------ | --------- | ------ | --------------------- |
| `GET`  | `/api/me` | Bearer | Get current user data |

### Documentation

| URL            | Description                       |
| -------------- | --------------------------------- |
| `/api/docs/`   | Swagger UI - Interactive API docs |
| `/api/redoc/`  | ReDoc - Alternative API docs      |
| `/api/schema/` | OpenAPI Schema (JSON)             |

## 📋 Response Format

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Pesan deskriptif",
  "data": {},
  "metadata": {
    "limit": 10,
    "page": 1,
    "totalItems": 2,
    "totalPages": 1
  }
}
```

## 🧪 Testing di Hugging Face

### 1. Register User

```bash
curl -X POST https://[username]-[space-name].hf.space/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "nickname": "Tester",
    "username": "testuser",
    "password": "password123"
  }'
```

### 2. Login

```bash
curl -X POST https://[username]-[space-name].hf.space/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### 3. Get Current User (dengan Bearer token)

```bash
curl -X GET https://[username]-[space-name].hf.space/api/me \
  -H "Authorization: Bearer <access_token>"
```

## 🔐 Security Notes

- ✅ **DEBUG = False** di production
- ✅ **ALLOWED_HOSTS = ['*']** untuk Hugging Face
- ✅ **CORS enabled** untuk cross-origin requests
- ✅ **JWT tokens** dengan expiry configurable
- ✅ **Supabase PostgreSQL** untuk database

## 🛠️ Troubleshooting

### Space failed to start

1. Check **Logs** di Hugging Face dashboard
2. Pastikan environment variables sudah di-set
3. Pastikan Dockerfile valid

### Database connection failed

1. Cek Supabase credentials
2. Pastikan Supabase project active
3. Pastikan connection pooler diaktifkan

### API docs not loading

1. Cek `/api/schema/` endpoint
2. Restart Space jika perlu
3. Check browser console untuk errors

## 📝 Konfigurasi yang Sudah Diterapkan

### Dockerfile

- ✅ Port 7860 (Hugging Face standard)
- ✅ Non-root user (security best practice)
- ✅ Gunicorn dengan 2 workers

### Settings

- ✅ CORS enabled
- ✅ DEBUG = False (production)
- ✅ ALLOWED_HOSTS = ['*']
- ✅ JWT Authentication

### Database

- ✅ Supabase Connection Pooler
- ✅ Port 6543 (pooler)
- ✅ SSL required

## 📚 Referensi

- [Hugging Face Spaces Documentation](https://huggingface.co/docs/hub/spaces)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/)
- [DRF Spectacular Documentation](https://drf-spectacular.readthedocs.io/)

---

Check out the configuration reference at https://huggingface.co/docs/hub/spaces-config-reference
