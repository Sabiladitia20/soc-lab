import { ShieldAlert, BookOpen, ArrowRight } from "lucide-react"

interface Props {
  params: {
    campaignId: string
    targetId: string
  }
}

export default async function SimulationLandingPage({ params }: Props) {
  const { campaignId, targetId } = await params

  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        <title>Simulasi Phishing — SecAI Awareness</title>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          
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
            max-width: 560px;
            width: 100%;
            text-align: center;
          }

          .icon-wrapper {
            width: 80px;
            height: 80px;
            border-radius: 20px;
            background: linear-gradient(135deg, #f59e0b20, #ef444420);
            border: 1px solid #f59e0b30;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 2rem;
            animation: pulse 2s ease-in-out infinite;
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.2); }
            50% { transform: scale(1.05); box-shadow: 0 0 30px 10px rgba(245, 158, 11, 0.1); }
          }

          .icon-wrapper svg {
            width: 40px;
            height: 40px;
            color: #f59e0b;
          }

          h1 {
            font-size: 1.75rem;
            font-weight: 800;
            margin-bottom: 0.75rem;
            background: linear-gradient(to right, #f59e0b, #ef4444);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .subtitle {
            font-size: 1.05rem;
            color: #94a3b8;
            line-height: 1.7;
            margin-bottom: 2rem;
          }

          .card {
            background: rgba(30, 41, 59, 0.6);
            border: 1px solid rgba(148, 163, 184, 0.1);
            border-radius: 16px;
            padding: 2rem;
            backdrop-filter: blur(10px);
            text-align: left;
            margin-bottom: 2rem;
          }

          .card h2 {
            font-size: 1rem;
            font-weight: 600;
            color: #e2e8f0;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .card h2 svg { width: 20px; height: 20px; color: #38bdf8; }

          .card ul {
            list-style: none;
            padding: 0;
          }

          .card li {
            padding: 0.6rem 0;
            border-bottom: 1px solid rgba(148, 163, 184, 0.08);
            color: #94a3b8;
            font-size: 0.9rem;
            line-height: 1.5;
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .card li:last-child { border-bottom: none; }

          .card li svg { width: 16px; height: 16px; color: #22c55e; flex-shrink: 0; margin-top: 2px; }

          .badge {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            background: rgba(56, 189, 248, 0.1);
            border: 1px solid rgba(56, 189, 248, 0.2);
            border-radius: 999px;
            padding: 0.35rem 0.85rem;
            font-size: 0.75rem;
            font-weight: 500;
            color: #38bdf8;
          }

          .footer {
            color: #475569;
            font-size: 0.8rem;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="icon-wrapper">
            <ShieldAlert />
          </div>
          
          <h1>Ini Adalah Simulasi Phishing</h1>
          
          <p className="subtitle">
            Tenang — ini bukan serangan nyata. Email yang kamu klik tadi adalah bagian dari 
            program <strong style={{ color: "#e2e8f0" }}>Security Awareness Training</strong> oleh SecAI.
          </p>
          
          <div className="card">
            <h2>
              <BookOpen />
              Apa yang bisa kamu pelajari?
            </h2>
            <ul>
              <li>
                <ArrowRight />
                Selalu periksa alamat pengirim sebelum mengklik link di email
              </li>
              <li>
                <ArrowRight />
                Waspadai email yang meminta tindakan mendesak (urgency tactic)
              </li>
              <li>
                <ArrowRight />
                Jangan pernah memasukkan kredensial di halaman yang tidak kamu kenal
              </li>
              <li>
                <ArrowRight />
                Laporkan email mencurigakan ke tim IT / Security
              </li>
            </ul>
          </div>
          
          <div className="badge">
            🛡️ SecAI Awareness Platform
          </div>
          
          <p className="footer" style={{ marginTop: "1.5rem" }}>
            Halaman ini bersifat edukatif. Data kamu aman dan tidak disimpan di sini.
          </p>
        </div>
      </body>
    </html>
  )
}
