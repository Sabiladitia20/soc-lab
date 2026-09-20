# Product Requirements Document (PRD)
# AI Security Awareness Platform

**Proyek:** Laporan Hasil Magang — SOC Analyst Internship
**Versi:** 2.0 (Full Project Scope)
**Tanggal:** Agustus 2026
**Author:** [Nama Kamu]

---

## 1. Ringkasan Eksekutif

**AI Security Awareness Platform** adalah web edukasi keamanan siber yang mengadaptasi pengalaman nyata magang sebagai SOC Analyst menjadi produk digital interaktif. Platform ini menggabungkan tiga hal:

1. **Edukasi** — materi tentang ancaman siber berbasis AI (phishing AI-generated, deepfake, prompt injection, social engineering modern)
2. **Simulasi interaktif** — tools latihan (phishing simulator, quiz, password/URL checker)
3. **Replika SOC environment** — mini dashboard bergaya SIEM/SOC platform asli (terinspirasi dari platform yang dipakai selama magang), lengkap dengan AI assistant

Proyek ini menjadi bukti konkret pemahaman teknis dari magang sekaligus portofolio pengembangan produk full-stack dengan integrasi AI.

---

## 2. Latar Belakang & Masalah

Selama magang sebagai SOC Analyst, ditemukan gap yang umum terjadi di banyak organisasi:
- Karyawan non-teknis rentan terhadap serangan siber berbasis AI generasi baru (phishing yang ditulis AI jauh lebih meyakinkan, deepfake voice/video untuk BEC fraud, dsb)
- Materi security awareness konvensional (poster, PDF, training tahunan) kurang engaging dan cepat dilupakan
- Tidak banyak tool edukasi yang mensimulasikan *bagaimana rasanya* jadi analyst yang menghadapi ancaman ini secara real-time

**Solusi:** platform edukasi yang interaktif, visual, dan memberi pengalaman "merasakan" sisi SOC sekaligus melatih kewaspadaan terhadap ancaman berbasis AI.

---

## 3. Tujuan Proyek

| Tujuan | Metrik Keberhasilan |
|---|---|
| Deliverable laporan magang yang solid | Diterima & dinilai baik oleh pembimbing akademik & industri |
| Edukasi awareness yang efektif | User bisa menyelesaikan minimal 1 modul quiz/simulator dengan pemahaman terukur (skor) |
| Showcase kemampuan teknis | Full-stack app dengan AI integration, dashboard data-dense, auth, deployment production |
| Reusable/scalable product | Bisa dikembangkan lebih lanjut pasca-laporan (portofolio kerja) |

---

## 4. Target Pengguna & Persona

1. **Mahasiswa/Pemula Security** — ingin belajar dasar ancaman AI security secara interaktif, bukan lewat teks panjang
2. **Dosen Penguji / Pembimbing Magang** — menilai kedalaman pemahaman teknis & eksekusi produk
3. **Karyawan Non-Teknis** — calon end-user pelatihan awareness di lingkungan kerja nyata
4. **Rekruter/Industry Reviewer** — melihat portofolio ini sebagai bukti kemampuan (untuk kebutuhan kerja setelah lulus)

---

## 5. Lingkup Produk (Scope)

### In-Scope
- Landing page & materi edukasi (artikel/MDX)
- Modul simulasi: phishing simulator, quiz awareness, password/URL checker
- Mini dashboard SOC (demo, data dummy/generated) — incidents, MITRE ATT&CK mapping, threat map
- AI Assistant (chatbot RAG berbasis materi platform)
- Autentikasi user + progress tracking + gamifikasi ringan (skor, badge)
- Halaman "About / Laporan Magang" — ringkasan proyek untuk keperluan akademik

### Out-of-Scope (fase ini)
- Integrasi ke SIEM/SOC tool asli (real data)
- Multi-tenant / organization management penuh
- Native mobile app
- Payment/monetization

---

## 6. Tech Stack

### Frontend
| Komponen | Pilihan | Alasan |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | Standar industri, SSR/SEO, banyak dipakai enterprise |
| Styling | **Tailwind CSS + shadcn/ui** | Cepat, konsisten, komponen production-grade |
| Animasi | **Framer Motion** | Transisi halus di landing & interaksi simulator |
| Chart/Data viz | **Recharts / Tremor** | Visualisasi dashboard (severity trend, alert distribution) |
| Icon | **Lucide React** | Konsisten dengan ekosistem shadcn |

### Backend & Data
| Komponen | Pilihan | Alasan |
|---|---|---|
| API layer | **Next.js Route Handlers / Server Actions** | Tidak perlu server terpisah, deploy jadi satu unit |
| Database | **Supabase (PostgreSQL)** | Setup cepat, sudah termasuk Auth & Storage |
| ORM | **Prisma** | Type-safe schema, migrasi rapi |
| Auth | **Supabase Auth (email/password + OAuth Google)** | Terintegrasi langsung dengan DB |
| Vector DB (RAG) | **Supabase pgvector** | Untuk AI assistant menjawab berdasar materi platform sendiri |

### AI Layer
| Komponen | Pilihan | Alasan |
|---|---|---|
| LLM | **Claude API (Anthropic) / OpenAI API** | Untuk chatbot edukasi & analisa jawaban simulator |
| Pattern | **RAG (Retrieval-Augmented Generation)** | Chatbot menjawab berbasis materi awareness yang sudah disusun, bukan general knowledge saja |
| Use case tambahan | Generate variasi email phishing dinamis untuk simulator, feedback otomatis di quiz |

### Infrastruktur
| Komponen | Pilihan |
|---|---|
| Hosting | **Vercel** (auto CI/CD dari GitHub) |
| Version control | **GitHub** |
| Monitoring (opsional) | Vercel Analytics / Sentry untuk error tracking |

---

## 7. Arsitektur Sistem (Overview)

```
┌─────────────────┐      ┌──────────────────────┐      ┌───────────────┐
│   Next.js App    │ ───► │  API Routes/Actions   │ ───► │   Supabase     │
│  (Frontend + SSR) │      │  (Business logic)     │      │ (DB + Auth +   │
└─────────────────┘      └──────────────────────┘      │  Storage +     │
        │                          │                     │  pgvector)     │
        │                          ▼                     └───────────────┘
        │                 ┌──────────────────┐
        └───────────────► │   Claude/OpenAI API │
                           │  (Chat + Analysis)   │
                           └──────────────────┘
```

---

## 8. Modul & Fitur Detail

### 8.1 Landing Page
- Hero section: value proposition + CTA ("Mulai Belajar" / "Coba Simulator")
- Preview visual dashboard (screenshot-style, sesuai referensi SOC platform)
- 3 pilar fitur (Belajar / Simulasi / Dashboard)
- Social proof / konteks magang (opsional)

### 8.2 Modul Edukasi (`/learn`)
- List artikel dengan kategori: Phishing AI-Generated, Deepfake & Voice Cloning, Prompt Injection, Social Engineering Modern
- Format konten via **MDX** — mudah ditulis, bisa embed komponen interaktif
- Fitur: bookmark, estimasi waktu baca, related articles

### 8.3 Phishing Simulator (`/simulator/phishing`)
- User disajikan contoh email (campuran phishing AI-generated vs legit)
- User memilih "Phishing" / "Legit" → feedback instan + penjelasan (bisa digenerate AI biar variatif)
- Skor akumulatif, tersimpan ke progress user

### 8.4 Quiz Awareness (`/simulator/quiz`)
- Multiple choice seputar materi
- Feedback per soal via AI (menjelaskan kenapa jawaban benar/salah)
- Hasil akhir + rekomendasi materi lanjutan

### 8.5 Password/URL Checker (`/simulator/checker`)
- Input password → analisa kekuatan + saran perbaikan
- Input URL → deteksi pola mencurigakan (heuristik sederhana, bukan real threat intel) + penjelasan AI

### 8.6 Mini SOC Dashboard (`/dashboard`)
*Direplikasi dari pengalaman nyata di tempat magang (lihat referensi visual)*
- **Incidents** (`/dashboard/incidents`): stat card (Active/New/Critical) + table (ID, Severity, Title, Status, SLA, Assignee, Created, Last Activity) — data dummy/generated
- **MITRE ATT&CK** (`/dashboard/mitre`): mapping visual teknik serangan yang relevan ke materi edukasi
- **Threat Map** (opsional): visualisasi peta ancaman (dummy data)

### 8.7 AI Assistant (`/assistant`)
- Chat interface (bubble kiri-kanan, riwayat chat, input dengan suggested prompts)
- RAG: jawaban berdasarkan materi platform (artikel edukasi) — bukan cuma general LLM knowledge
- Use case: "Jelaskan apa itu prompt injection", "Analisa email ini phishing atau bukan"

### 8.8 Auth & Progress Tracking
- Login/register (email atau Google OAuth)
- Dashboard progress user: skor quiz, badge/achievement, riwayat simulator
- Gamifikasi ringan: badge ("Phishing Hunter", "Quiz Master")

### 8.9 About / Laporan Magang (`/about`)
- Ringkasan proyek, tujuan akademik, tech stack, dan refleksi magang — bagian ini yang di-link langsung ke keperluan laporan kuliah

---

## 9. Data Model (Overview — Prisma Schema)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  progress  Progress[]
  attempts  QuizAttempt[]
}

model Article {
  id        String   @id @default(cuid())
  slug      String   @unique
  title     String
  category  String
  content   String   // MDX content
  createdAt DateTime @default(now())
}

model QuizQuestion {
  id          String   @id @default(cuid())
  question    String
  options     Json
  answerIndex Int
  explanation String
}

model QuizAttempt {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  score     Int
  createdAt DateTime @default(now())
}

model Incident {
  id         String   @id @default(cuid())
  severity   String   // Low, Medium, High, Critical
  title      String
  status     String   // New, Acknowledged, Closed
  sla        String   // OK, Breached
  assignee   String?
  createdAt  DateTime @default(now())
}

model Progress {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  module    String   // phishing, quiz, checker
  status    String   // completed, in-progress
  score     Int?
}
```

---

## 10. Non-Functional Requirements

| Kategori | Requirement |
|---|---|
| Performance | First load < 2.5s (Vercel edge + Next.js SSR) |
| Responsiveness | Mobile-first, breakpoint standar Tailwind |
| Aksesibilitas | Kontras warna sesuai WCAG AA (penting karena dark theme) |
| Keamanan | Auth via Supabase (hashed password, JWT), rate limiting API AI |
| Skalabilitas | Arsitektur modular, mudah tambah modul baru (mis. simulator baru) |

---

## 11. Roadmap & Milestone

| Fase | Durasi | Deliverable |
|---|---|---|
| **1. UI/UX Design** | Minggu 1–3 | Design system, wireframe semua halaman, project setup |
| **2. Core Build (Static + Konten)** | Minggu 4–6 | Landing, modul edukasi (MDX), routing lengkap |
| **3. Simulator & Quiz** | Minggu 7–8 | Phishing simulator, quiz, password/URL checker (logic + scoring) |
| **4. Dashboard SOC Demo** | Minggu 9–10 | Incidents table, MITRE mapping, data generator |
| **5. AI Integration** | Minggu 11–12 | Chatbot RAG, AI feedback di simulator/quiz |
| **6. Auth & Progress** | Minggu 13 | Login, progress tracking, badge |
| **7. Testing, Polish, Deploy** | Minggu 14 | QA, responsive check, deploy Vercel, dokumentasi laporan |

*(Sesuaikan durasi dengan timeline magang/semester kamu — bisa dipadatkan kalau waktu terbatas)*

---

## 12. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Scope terlalu besar untuk waktu magang/laporan | Prioritaskan modul edukasi + 1 simulator + dashboard demo sebagai MVP; AI assistant & gamifikasi jadi "nice to have" |
| Biaya API AI (Claude/OpenAI) | Gunakan rate limit, cache response umum, model kecil (haiku/mini) untuk fitur non-kritikal |
| Kompleksitas RAG | Mulai dengan retrieval sederhana (keyword/embedding basic) sebelum optimasi lanjut |
| Data dashboard terlihat "palsu"/tidak realistis | Gunakan generator data dengan pola realistis (timestamp masuk akal, distribusi severity wajar) berdasarkan observasi asli di tempat magang |

---

## 13. Struktur Proyek (Referensi Teknis)

```
app/
  (marketing)/page.tsx
  learn/[slug]/page.tsx
  simulator/
    phishing/page.tsx
    quiz/page.tsx
    checker/page.tsx
  dashboard/
    incidents/page.tsx
    mitre/page.tsx
  assistant/page.tsx
  about/page.tsx
  api/
    chat/route.ts
    incidents/route.ts
components/
  ui/            (shadcn)
  layout/        (sidebar, topbar)
  dashboard/
  simulator/
lib/
  prisma.ts
  ai/            (claude client, RAG helper)
  mock-data.ts
prisma/
  schema.prisma
```

---

## 14. Kaitan dengan Laporan Magang

Bagian ini bisa dikutip langsung untuk laporan:

> Platform ini dikembangkan sebagai aplikasi dari pengalaman magang sebagai SOC Analyst, mengadaptasi pola kerja dan antarmuka SOC platform (incident triage, severity classification, SLA tracking) ke dalam produk edukasi publik. Selain menunjukkan pemahaman terhadap konsep SOC operasional dan MITRE ATT&CK framework, proyek ini juga mendemonstrasikan kemampuan pengembangan full-stack modern dengan integrasi kecerdasan buatan (RAG-based AI assistant) untuk meningkatkan efektivitas edukasi keamanan siber terhadap ancaman berbasis AI generasi terbaru.

---

## 15. Next Steps

1. Finalisasi MVP scope (rekomendasi: Landing + Learn + 1 Simulator + Dashboard Incidents + About — cukup kuat untuk laporan tanpa terlalu besar)
2. Mulai Fase 1 (UI/UX) — sudah ada breakdown detail di dokumen terpisah kalau dibutuhkan
3. Setup repository + project skeleton
4. Susun konten materi edukasi (bisa dicicil dari materi yang sudah dipelajari selama magang)