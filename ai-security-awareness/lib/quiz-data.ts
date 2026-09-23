export interface QuizQuestion {
  id: string
  category: "AI Security" | "Phishing" | "SOC & DFIR" | "Authentication"
  difficulty: "Easy" | "Medium" | "Hard"
  question: string
  scenario?: string
  options: string[]
  answerIndex: number
  explanation: string
  mitreRef?: string
}

export const securityQuizQuestions: QuizQuestion[] = [
  // --- AI SECURITY (Easy, Medium, Hard) ---
  {
    id: "q-1",
    category: "AI Security",
    difficulty: "Medium",
    question: "Apa yang membedakan serangan 'Indirect Prompt Injection' dengan 'Direct Prompt Injection'?",
    scenario: "Sebuah AI Agent perusahaan diizinkan membaca email dan merangkum lampiran web dari vendor luar.",
    options: [
      "Indirect injection dilakukan melalui server database secara langsung tanpa melibatkan model AI.",
      "Peretas menyisipkan instruksi berbahaya ke dalam konten eksternal (misal: halaman web atau PDF) yang kemudian diproses oleh AI.",
      "Indirect injection hanya bisa dilakukan menggunakan serangan fisik pada server GPU.",
      "Tidak ada perbedaan, keduanya mengharuskan peretas mengetik prompt langsung di kotak obrolan AI."
    ],
    answerIndex: 1,
    explanation: "Indirect Prompt Injection terjadi ketika payload eksploit disembunyikan di dalam data yang dibaca atau dirangkum oleh AI (misal dokumen web, email masuk), sehingga AI mengeksekusi perintah penyerang tanpa interaksi langsung di chatbox.",
    mitreRef: "AML.T0051 - LLM Prompt Injection"
  },
  {
    id: "q-2",
    category: "AI Security",
    difficulty: "Easy",
    question: "Apa risiko utama jika karyawan memasukkan kode program proprietary atau data pribadi nasabah (PII) ke layanan Public LLM gratis?",
    scenario: "Seorang pengembang menempelkan seluruh file konfigurasi server yang berisi API Key ke ChatGPT publik untuk mencari bug.",
    options: [
      "Model AI akan langsung mengalami crash dan tidak dapat digunakan lagi.",
      "Data sensitif dapat disimpan oleh penyedia model untuk pelatihan ulang dan berisiko bocor ke pengguna lain.",
      "Komputer karyawan akan otomatis terinfeksi trojan perbankan.",
      "Tidak ada risiko karena semua layanan LLM otomatis mengenkripsi data secara offline."
    ],
    answerIndex: 1,
    explanation: "Sebagian besar penyedia AI publik menggunakan interaksi pengguna sebagai data pelatihan (training corpus), yang berpotensi memaparkan kredensial atau rahasia dagang kepada publik melalui model training leakage (OWASP LLM06).",
    mitreRef: "OWASP LLM06 - Sensitive Info Disclosure"
  },
  {
    id: "q-3",
    category: "AI Security",
    difficulty: "Hard",
    question: "Teknik pertahanan apa yang paling efektif untuk memitigasi serangan jailbreak pada aplikasi berbasis LLM enterprise?",
    scenario: "Perusahaan finansial merilis chatbot customer service yang terhubung dengan API transfer rekening.",
    options: [
      "Hanya mengandalkan instruksi negatif di system prompt seperti 'Jangan pernah transfer uang tanpa izin'.",
      "Menggunakan arsitektur Dual-LLM Guardrail (Input Classifier & Output Sanitizer) serta membatasi hak akses API (Least Privilege).",
      "Mematikan koneksi internet pada server tempat LLM di-hosting.",
      "Mengganti model AI dengan model berbasis Rule-based sederhana tahun 1990."
    ],
    answerIndex: 1,
    explanation: "System prompt mudah dikesampingkan dengan prompt injection. Pendekatan defense-in-depth menggunakan Dual-LLM Guardrail yang memvalidasi input/output serta pembatasan hak eksekusi API (Least Privilege) adalah standar industri terkuat.",
    mitreRef: "AML.M0015 - Guardrail Filtering"
  },
  {
    id: "q-4",
    category: "AI Security",
    difficulty: "Medium",
    question: "Bagaimana cara paling efektif untuk memverifikasi keaslian panggilan darurat yang dicurigai menggunakan Voice Cloning (Deepfake Audio)?",
    scenario: "Seorang manajer menerima telepon dari nomor yang mirip dengan direktur perusahaan, meminta otorisasi transfer darurat karena kecelakaan di luar negeri.",
    options: [
      "Mendengarkan suara dengan headphone berkualitas tinggi untuk mencari desisan latar belakang.",
      "Menutup telepon dan menghubungi kembali direktur melalui nomor terdaftar resmi di direktori internal perusahaan (Out-of-Band Verification).",
      "Meminta penipu mengirimkan pesan suara tambahan melalui WhatsApp.",
      "Langsung mentransfer dana sebagian sebagai tindakan darurat."
    ],
    answerIndex: 1,
    explanation: "Prinsip Zero-Trust mengharuskan verifikasi Out-of-Band (saluran sekunder independen). Menghubungi kembali nomor resmi yang terverifikasi memastikan Anda berbicara dengan pihak yang sebenarnya.",
    mitreRef: "T1598 - Phishing for Information"
  },
  {
    id: "q-5",
    category: "AI Security",
    difficulty: "Hard",
    question: "Apa yang dimaksud dengan kerentanan 'LLM Hallucination Exploitation' atau 'Package Hallucination'?",
    scenario: "Pengembang meminta AI merekomendasikan library Python untuk memproses file enkripsi.",
    options: [
      "AI sengaja merusak hard disk pengembang dengan kode assembly berbahaya.",
      "AI merekomendasikan nama package fiktif yang tidak ada, lalu peretas mendaftarkan nama package tersebut di PyPI/npm dengan muatan malware.",
      "AI menolak menjawab pertanyaan karena mengalami kelebihan beban memori.",
      "AI mengubah bahasa pemrograman dari Python menjadi C++ tanpa konfirmasi."
    ],
    answerIndex: 1,
    explanation: "Package Hallucination terjadi ketika LLM mengarang nama library yang belum pernah ada. Penyerang memindai halusinasi umum tersebut, lalu mengunggah paket malware dengan nama persis di repositori publik (PyPI/npm) untuk meracuni rantai pasok (Supply Chain Attack).",
    mitreRef: "T1195.001 - Supply Chain Compromise"
  },

  // --- PHISHING & SOCIAL ENGINEERING ---
  {
    id: "q-6",
    category: "Phishing",
    difficulty: "Easy",
    question: "Manakah ciri utama yang paling sering menandakan sebuah email merupakan upaya phishing massal?",
    scenario: "Karyawan menerima email berjudul 'Akun Anda Akan Dihapus dalam 2 Jam!' dengan tombol login besar berwarna merah.",
    options: [
      "Menggunakan sapaan umum seperti 'Dear Customer' dan menciptakan rasa urgensi yang memaksa untuk mengklik link.",
      "Email dikirim dari rekan kerja yang duduk di sebelah Anda.",
      "Email memiliki tanda tangan digital yang valid dari tim IT internal.",
      "Format email ditulis dalam teks polos tanpa link atau lampiran."
    ],
    answerIndex: 0,
    explanation: "Urgensi palsu (False Sense of Urgency) dan sapaan generik adalah pemicu psikologis paling umum yang digunakan penyerang agar korban panik dan mengabaikan kejanggalan alamat pengirim.",
    mitreRef: "T1566.001 - Spearphishing Attachment"
  },
  {
    id: "q-7",
    category: "Phishing",
    difficulty: "Medium",
    question: "Manakah indikasi paling kuat bahwa sebuah email konfirmasi pembayaran vendor merupakan serangan Spear Phishing bertenaga AI?",
    scenario: "Staf keuangan menerima email mendesak dari 'CEO' yang meminta transfer dana segera dengan gaya bahasa yang sangat luwes dan tanpa kesalahan tata bahasa.",
    options: [
      "Email memiliki banyak kesalahan ketik (typo) dan bahasa asing yang kasar.",
      "Header 'Reply-To' berbeda dengan domain perusahaan resmi dan meminta pengabaian prosedur verifikasi via telepon.",
      "Email dikirim menggunakan server Gmail biasa pada jam kerja normal.",
      "Email tersebut memiliki lampiran berformat gambar PNG transparan."
    ],
    answerIndex: 1,
    explanation: "AI generatif mampu menyusun kalimat dengan tata bahasa sempurna. Namun, indikator teknis seperti ketidakcocokan Reply-To domain dan manipulasi psikologis untuk melompati kanal verifikasi ganda tetap menjadi red flag utama.",
    mitreRef: "T1566.002 - Spearphishing Link"
  },
  {
    id: "q-8",
    category: "Phishing",
    difficulty: "Hard",
    question: "Bagaimana cara kerja serangan 'Reverse-Proxy Phishing' (seperti alat Evilginx) dalam membobol akun korban?",
    scenario: "Korban mengklik tautan phishing, memasukkan username, password, dan kode OTP aplikasi authenticator, lalu dialihkan ke halaman asli.",
    options: [
      "Alat ini mendownload keylogger langsung ke dalam BIOS komputer korban.",
      "Server penyerang bertindak sebagai perantara transparan yang meneruskan data ke server login asli dan mencuri Session Cookie yang telah terotentikasi.",
      "Alat ini menebak kode OTP dengan mencoba jutaan kombinasi angka per detik.",
      "Alat ini mematikan jaringan seluler korban sehingga SMS verifikasi tidak terkirim."
    ],
    answerIndex: 1,
    explanation: "Reverse-proxy phishing memproksikan interaksi secara real-time antara korban dan layanan asli (misal Microsoft 365). Setelah login sukses, penyerang mencuri Session Cookie / Token auth korban, membypass MFA berbasis OTP biasa.",
    mitreRef: "T1539 - Steal Web Session Cookie"
  },
  {
    id: "q-9",
    category: "Phishing",
    difficulty: "Easy",
    question: "Apa yang dimaksud dengan teknik serangan 'Quishing' (QR Code Phishing)?",
    scenario: "Terdapat poster di kafetaria kantor bertuliskan 'Pembaruan VPN Cepat - Scan QR Code Ini Untuk Setup'.",
    options: [
      "Menyerang hardware kamera smartphone dengan sinar inframerah.",
      "Menyematkan URL berbahaya ke dalam gambar kode QR agar lolos dari pemindaian filter keamanan email berbasis teks.",
      "Mengubah setting WiFi router otomatis saat QR code difoto.",
      "Mencuri pulsa pengguna secara otomatis saat membuka kamera."
    ],
    answerIndex: 1,
    explanation: "Quishing memanfaatkan kode QR untuk menyembunyikan link phishing dari inspeksi filter email teks tradisional, memancing korban memindai menggunakan smartphone pribadi yang seringkali tidak memiliki proteksi EDR perusahaan.",
    mitreRef: "T1566.002 - Spearphishing Link"
  },
  {
    id: "q-10",
    category: "Phishing",
    difficulty: "Medium",
    question: "Apa fungsi dari protokol DMARC dalam pertahanan email perusahaan?",
    scenario: "Tim security mendeteksi domain perusahaan sering digunakan orang luar untuk mengirim email spam penipuan.",
    options: [
      "DMARC otomatis menghapus akun email karyawan yang membuka link phish.",
      "DMARC menentukan kebijakan (Reject/Quarantine) jika email gagal diverifikasi oleh SPF atau DKIM, mencegah spoofing domain pengirim.",
      "DMARC mempercepat pengiriman email ke inbox penerima dalam hitungan milidetik.",
      "DMARC mengenkripsi seluruh lampiran email menggunakan algoritma AES-256."
    ],
    answerIndex: 1,
    explanation: "DMARC (Domain-based Message Authentication, Reporting, and Conformance) memungkinkan pemilik domain menentukan tindakan tegas jika email dari domainnya gagal melewati validasi SPF dan DKIM, mencegah pemalsuan pengirim (domain spoofing).",
    mitreRef: "M1054 - Software Configuration"
  },

  // --- SOC & DFIR (Incident Response & Forensics) ---
  {
    id: "q-11",
    category: "SOC & DFIR",
    difficulty: "Medium",
    question: "Dalam triage alert SOC, jika ditemukan proses 'svchost.exe' berjalan dari direktori 'C:\\Users\\User\\AppData\\Local\\Temp', tindakan apa yang harus segera diambil?",
    scenario: "SIEM memunculkan alert 'High Severity: Masquerading Process' pada workstation tim marketing.",
    options: [
      "Mengabaikan alert karena svchost.exe adalah proses bawaan Windows yang aman.",
      "Mengisolasi workstation dari jaringan dan mengumpulkan dump memori untuk analisis malware (DFIR).",
      "Menghapus folder AppData pengguna dan me-restart komputer.",
      "Menunggu hingga pengguna selesai bekerja di sore hari."
    ],
    answerIndex: 1,
    explanation: "svchost.exe yang sah HANYA boleh berjalan dari C:\\Windows\\System32. Jika berjalan dari AppData Temp, itu adalah teknik Masquerading (MITRE T1036) malware. Komputer harus segera diisolasi dari jaringan.",
    mitreRef: "T1036 - Masquerading"
  },
  {
    id: "q-12",
    category: "SOC & DFIR",
    difficulty: "Easy",
    question: "Apa tujuan utama dari tahap 'Containment' dalam siklus penanganan insiden keamanan siber (NIST Incident Response Framework)?",
    scenario: "Satu server web internal dilaporkan telah terinfeksi ransomware dan mulai mengenkripsi folder bersama.",
    options: [
      "Menghapus seluruh database dan membeli server baru.",
      "Mencegah penyebaran ancaman ke sistem lain tanpa merusak bukti forensik digital.",
      "Mengumumkan insiden ke media sosial sesegera mungkin.",
      "Memformat hard disk korban sebelum membuat salinan data."
    ],
    answerIndex: 1,
    explanation: "Tujuan fase Containment (Penahanan) adalah menghentikan penyebaran insiden (misalnya memutus koneksi jaringan server terinfeksi) agar kerusakan tidak meluas ke segmen lain sambil mempertahankan integritas bukti forensik.",
    mitreRef: "NIST SP 800-61 Rev. 2"
  },
  {
    id: "q-13",
    category: "SOC & DFIR",
    difficulty: "Hard",
    question: "Dalam investigasi forensik Windows, artefak manakah yang membuktikan bahwa sebuah file executable pernah dieksekusi oleh pengguna?",
    scenario: "Seorang analis mencari bukti apakah malware 'updater.exe' sempat dijalankan sebelum dihapus oleh penyerang.",
    options: [
      "C:\\Windows\\System32\\drivers\\etc\\hosts",
      "Prefetch files (.pf), Shimcache (AppCompatCache), dan UserAssist Registry Key.",
      "File boot.ini dan pagefile.sys saja.",
      "Folder Recycle Bin kosong milik user."
    ],
    answerIndex: 1,
    explanation: "Prefetch, Shimcache, Amcache, dan UserAssist adalah artefak forensik Windows utama (Execution Artifacts) yang mencatat riwayat eksekusi aplikasi beserta stempel waktu (timestamps) meskipun file asli telah dihapus penyerang.",
    mitreRef: "T1204 - User Execution"
  },
  {
    id: "q-14",
    category: "SOC & DFIR",
    difficulty: "Medium",
    question: "Apa yang dimaksud dengan teknik 'Pass-the-Hash' dalam pergerakan lateral (Lateral Movement) penyerang di lingkungan Active Directory?",
    scenario: "Penyerang berhasil mengompromikan satu workstation dan berusaha mengakses Domain Controller.",
    options: [
      "Penyerang menebak password akun administrator secara manual satu per satu.",
      "Penyerang mengotentikasi ke sistem remote menggunakan hash NTLM password yang dicuri dari memori LSASS tanpa perlu memecahkan password teks aslinya.",
      "Penyerang mengirim email spam ke seluruh domain.",
      "Penyerang membakar kabel jaringan switch utama."
    ],
    answerIndex: 1,
    explanation: "Pass-the-Hash (PtH) mengeksploitasi protokol NTLM di mana penyerang menggunakan hash kata sandi yang diekstrak langsung dari memori untuk mengotentikasi ke mesin lain tanpa perlu mengetahui kata sandi plaintext.",
    mitreRef: "T1550.002 - Pass the Hash"
  },
  {
    id: "q-15",
    category: "SOC & DFIR",
    difficulty: "Hard",
    question: "Apa arti dari metrik 'MTTD' dan 'MTTR' yang menjadi indikator performa tim SOC?",
    scenario: "CISO mengevaluasi efektivitas operasional Security Operations Center selama kuartal terakhir.",
    options: [
      "Mean Time to Detect (rata-rata waktu mendeteksi ancaman) dan Mean Time to Respond/Remediate (rata-rata waktu menanggulangi ancaman).",
      "Max Transfer to Disk dan Min Total Router.",
      "Monthly Threat Total Data dan Monthly Target Total Rate.",
      "Metrik untuk menghitung kecepatan download koneksi internet SOC."
    ],
    answerIndex: 0,
    explanation: "MTTD (Mean Time to Detect) mengukur berapa lama waktu yang dibutuhkan sejak penyerang masuk hingga terdeteksi, sedangkan MTTR (Mean Time to Respond) mengukur kecepatan tim mengisolasi dan memulihkan insiden.",
    mitreRef: "SOC KPI Framework"
  },

  // --- AUTHENTICATION & IDENTITY ---
  {
    id: "q-16",
    category: "Authentication",
    difficulty: "Medium",
    question: "Mengapa MFA berbasis SMS (OTP) dianggap lebih rentan dibandingkan MFA berbasis FIDO2 / Passkey terhadap serangan phishing modern?",
    scenario: "Perusahaan berencana meningkatkan standar autentikasi bagi seluruh karyawan SOC dan manajemen.",
    options: [
      "SMS OTP memerlukan kuota internet yang lebih mahal.",
      "Kode OTP SMS dapat dicegat dengan SIM Swapping atau di-relay secara real-time oleh reverse-proxy phishing kit (seperti Evilginx).",
      "FIDO2 hanya bisa digunakan pada perangkat Android generasi terbaru.",
      "SMS OTP tidak memiliki batasan waktu kedaluwarsa (expired time)."
    ],
    answerIndex: 1,
    explanation: "Reverse-proxy phishing modern mampu menangkap kode SMS OTP secara real-time. FIDO2 / WebAuthn kebal terhadap phishing karena terikat secara kriptografis dengan origin URL domain resmi (Domain Binding).",
    mitreRef: "T1110 - Brute Force / MFA Bypass"
  },
  {
    id: "q-17",
    category: "Authentication",
    difficulty: "Easy",
    question: "Apa fungsi teknik 'Salting' dalam penyimpanan hash kata sandi pengguna di database?",
    scenario: "Arsitek sistem merancang tabel pengguna baru untuk portal keamanan enterprise.",
    options: [
      "Menambah string acak unik pada setiap password sebelum di-hash untuk menggagalkan serangan Rainbow Table dan mendiversifikasi hash yang identik.",
      "Mengompres ukuran kata sandi agar hemat kapasitas hard disk.",
      "Mengirimkan salinan password ke email backup secara otomatis.",
      "Menolak pendaftaran kata sandi yang mengandung angka."
    ],
    answerIndex: 0,
    explanation: "Salt adalah string acak yang ditambahkan ke kata sandi sebelum proses hashing. Hal ini memastikan bahwa dua pengguna dengan kata sandi yang sama akan memiliki nilai hash yang berbeda dan membatalkan keefektifan kamus Rainbow Table.",
    mitreRef: "CWE-759 - Use of a One-Way Hash without a Salt"
  },
  {
    id: "q-18",
    category: "Authentication",
    difficulty: "Hard",
    question: "Apa yang membedakan protokol OAuth 2.0 dengan OpenID Connect (OIDC)?",
    scenario: "Tim security mereview arsitektur SSO (Single Sign-On) aplikasi web baru.",
    options: [
      "OAuth 2.0 adalah protokol untuk Otorisasi (Authorization/Akses data), sedangkan OIDC adalah lapisan identitas di atas OAuth 2.0 untuk Otentikasi (Authentication/Verifikasi siapa pengguna).",
      "OAuth 2.0 hanya berjalan di sistem operasi Windows, sedangkan OIDC di Linux.",
      "OIDC tidak membutuhkan token, sedangkan OAuth 2.0 menggunakan cookie biasa.",
      "OAuth 2.0 menggantikan seluruh sistem firewall jaringan."
    ],
    answerIndex: 0,
    explanation: "OAuth 2.0 dirancang untuk otorisasi (memberi izin aplikasi pihak ketiga mengakses sumber daya via Access Token). OIDC dibangun di atas OAuth 2.0 untuk menambahkan otentikasi identitas pengguna (melalui ID Token berformat JWT).",
    mitreRef: "RFC 6749 / OpenID Core 1.0"
  },
  {
    id: "q-19",
    category: "Authentication",
    difficulty: "Medium",
    question: "Bagaimana prinsip kerja 'MFA Fatigue' atau 'MFA Push Bombing' yang sering digunakan penyerang untuk membobol akun korporat?",
    scenario: "Seorang manajer menerima ratusan notifikasi persetujuan login di smartphone miliknya pada pukul 03:00 dini hari.",
    options: [
      "Penyerang meretas server push notification milik Google atau Apple.",
      "Penyerang membombardir ponsel korban dengan permintaan persetujuan MFA bertubi-tubi hingga korban merasa frustrasi dan tidak sengaja menekan tombol 'Approve'.",
      "Penyerang mengirim virus yang merusak baterai smartphone korban.",
      "Penyerang menebak pola kunci layar smartphone korban."
    ],
    answerIndex: 1,
    explanation: "MFA Fatigue mengandalkan kelelahan mental korban. Pelaku mengirimkan gelombang push alert terus-menerus di waktu istirahat agar korban menyerah dan menekan 'Yes, It's me'. Solusinya adalah beralih ke Number Matching MFA.",
    mitreRef: "T1621 - Multi-Factor Authentication Request Generation"
  },
  {
    id: "q-20",
    category: "Authentication",
    difficulty: "Easy",
    question: "Mengapa password manager direkomendasikan daripada mengingat kata sandi secara manual di banyak situs?",
    scenario: "Karyawan mengeluh kesulitan mengingat 20 kombinasi kata sandi akun bisnis.",
    options: [
      "Password manager otomatis meretas akun media sosial orang lain.",
      "Password manager memungkinkan pembuatan kata sandi panjang dan unik untuk setiap layanan serta mendeteksi URL phishing yang tidak cocok.",
      "Password manager menghapus kebutuhan autentikasi dua faktor (MFA).",
      "Password manager hanya bisa diakses menggunakan koneksi satelit."
    ],
    answerIndex: 1,
    explanation: "Password manager mencegah kebiasaan buruk daur ulang kata sandi (Password Reuse). Selain menghasilkan string acak yang kuat, autofill password manager hanya akan mengisi kredensial pada domain resmi yang tepat, melindungi dari phishing typo.",
    mitreRef: "NIST SP 800-63B - Digital Identity Guidelines"
  }
]
