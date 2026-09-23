import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Simulasi Phishing — SecAI Awareness</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      color: #e2e8f0;
      padding: 1.5rem;
    }

    .container {
      max-width: 580px;
      width: 100%;
      text-align: center;
    }

    .icon-wrapper {
      width: 88px;
      height: 88px;
      border-radius: 24px;
      background: linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.15));
      border: 1px solid rgba(245,158,11,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 2rem;
      animation: pulse 2.5s ease-in-out infinite;
      font-size: 44px;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245,158,11,0.15); }
      50% { transform: scale(1.04); box-shadow: 0 0 40px 12px rgba(245,158,11,0.08); }
    }

    .tag {
      display: inline-block;
      background: rgba(239,68,68,0.12);
      border: 1px solid rgba(239,68,68,0.25);
      border-radius: 999px;
      padding: 0.3rem 1rem;
      font-size: 0.72rem;
      font-weight: 700;
      color: #f87171;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 1.25rem;
    }

    h1 {
      font-size: 1.85rem;
      font-weight: 800;
      margin-bottom: 1rem;
      background: linear-gradient(to right, #fbbf24, #ef4444);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1.2;
    }

    .subtitle {
      font-size: 1rem;
      color: #94a3b8;
      line-height: 1.75;
      margin-bottom: 2rem;
    }

    .subtitle strong { color: #e2e8f0; }
    .subtitle .brand { color: #38bdf8; }

    .warning-box {
      background: rgba(239,68,68,0.07);
      border: 1px solid rgba(239,68,68,0.2);
      border-radius: 12px;
      padding: 1rem 1.25rem;
      text-align: left;
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
      color: #fca5a5;
      line-height: 1.65;
    }

    .warning-box strong { color: #f87171; }

    .card {
      background: rgba(30,41,59,0.5);
      border: 1px solid rgba(148,163,184,0.08);
      border-radius: 16px;
      padding: 1.5rem;
      text-align: left;
      margin-bottom: 1.5rem;
    }

    .card-title {
      font-size: 0.75rem;
      font-weight: 700;
      color: #38bdf8;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .card ul { list-style: none; }

    .card li {
      padding: 0.6rem 0;
      border-bottom: 1px solid rgba(148,163,184,0.06);
      color: #94a3b8;
      font-size: 0.875rem;
      line-height: 1.6;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .card li:last-child { border-bottom: none; }

    .check {
      color: #22c55e;
      font-size: 1rem;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(56,189,248,0.08);
      border: 1px solid rgba(56,189,248,0.15);
      border-radius: 999px;
      padding: 0.4rem 1rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: #38bdf8;
    }

    .footer {
      color: #475569;
      font-size: 0.78rem;
      margin-top: 1.25rem;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon-wrapper">⚠️</div>

    <div class="tag">Simulasi Phishing</div>

    <h1>Kamu Baru Saja Terkena Phishing!</h1>

    <p class="subtitle">
      Tenang — ini bukan serangan nyata. Email yang kamu klik dan form yang kamu isi adalah bagian dari
      <strong>Security Awareness Training</strong> oleh <span class="brand">SecAI</span>.
    </p>

    <div class="warning-box">
      <strong>⚠️ Data yang kamu masukkan</strong> (email, password, dll.) telah tercatat oleh tim Security Awareness sebagai bagian dari pelatihan ini.
      Dalam serangan nyata, data tersebut akan langsung dicuri oleh peretas.
    </div>

    <div class="card">
      <div class="card-title">📚 Yang perlu kamu perhatikan</div>
      <ul>
        <li><span class="check">✓</span> Selalu periksa URL di address bar sebelum mengisi form login apapun</li>
        <li><span class="check">✓</span> Waspadai email yang menciptakan urgensi atau rasa takut (urgency tactic)</li>
        <li><span class="check">✓</span> Jangan pernah memasukkan password di halaman yang tidak kamu kenal</li>
        <li><span class="check">✓</span> Periksa alamat pengirim email dengan teliti — satu karakter beda bisa jadi phishing</li>
        <li><span class="check">✓</span> Laporkan email mencurigakan ke tim IT / Security kamu segera</li>
      </ul>
    </div>

    <div class="badge">🛡️ SecAI Security Awareness Platform</div>

    <p class="footer">
      Halaman ini adalah bagian dari simulasi phishing yang sah.<br>
      Data yang tersimpan hanya digunakan untuk laporan awareness internal.
    </p>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
}
