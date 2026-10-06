import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const SIMULATION_TEMPLATES = [
  {
    title: "SQL Injection Attempt in Login Parameter",
    severity: "Critical",
    sourceIp: "185.220.101.5",
    ruleId: "RULE-SQLI-001",
    ruleName: "SQL Injection Pattern Detected",
    mitreTechnique: "T1190",
    rawDetails: "Client IP: 185.220.101.5\nHTTP Method: POST\nRequest URI: /api/v1/auth/login\nPayload: ' OR 1=1; DROP TABLE users; --\nUser-Agent: sqlmap/1.6#stable\nMatched Pattern: SQL Injection Regex",
  },
  {
    title: "Multiple Failed SSH Logins (Brute Force)",
    severity: "High",
    sourceIp: "194.26.29.112",
    ruleId: "RULE-BRUTE-002",
    ruleName: "SSH Authentication Failure Surge",
    mitreTechnique: "T1110.001",
    rawDetails: `Source IP: 194.26.29.112\nPort: 22 (SSH)\nAttempts Count: 48 failed attempts in 30s\nTarget User: root, admin, ubuntu\nAuth Status: FAILED (Pam_unix invalid credentials)`,
  },
  {
    title: "Suspicious PowerShell Encoded Command Execution",
    severity: "Critical",
    sourceIp: "10.0.4.88",
    ruleId: "RULE-EXEC-005",
    ruleName: "Obfuscated PowerShell Execution",
    mitreTechnique: "T1059.001",
    rawDetails: `Host: WIN-FINANCE-04\nProcess: powershell.exe\nCommand Line: powershell.exe -NoP -NonI -W Hidden -Enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAA...`,
  },
  {
    title: "Outbound Connection to Known Phishing C2",
    severity: "High",
    sourceIp: "192.168.1.104",
    ruleId: "RULE-NET-007",
    ruleName: "Malicious External C2 Communication",
    mitreTechnique: "T1071.001",
    rawDetails: `Internal Host: 192.168.1.104 (HR-Laptop-02)\nDestination IP: 45.154.255.89 (Malicious C2 / Netherlands)\nDNS Query: auth-bca-security.xyz\nProtocol: HTTPS / TLS 1.3\nThreat Feed: ThreatConnect Malicious Domain`,
  },
  {
    title: "Suspicious APK Download Detected in HTTP Traffic",
    severity: "Medium",
    sourceIp: "103.111.82.14",
    ruleId: "RULE-MALW-009",
    ruleName: "Direct APK Mobile Trojan Download",
    mitreTechnique: "T1204.002",
    rawDetails: `Source IP: 103.111.82.14\nURI: /download/surat_tilang_elektronik.apk\nContent-Type: application/vnd.android.package-archive\nAV Signature: Android.Trojan.Spy.Agent.GB`,
  },
]

export async function POST() {
  try {
    // Pick a random template
    const template =
      SIMULATION_TEMPLATES[Math.floor(Math.random() * SIMULATION_TEMPLATES.length)]

    const newIncident = await prisma.incident.create({
      data: {
        title: template.title,
        severity: template.severity,
        status: "New",
        sla: "OK",
        sourceIp: template.sourceIp,
        ruleId: template.ruleId,
        ruleName: template.ruleName,
        mitreTechnique: template.mitreTechnique,
        rawDetails: template.rawDetails,
        alerts: 1,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Simulated incident created successfully",
      incident: newIncident,
    })
  } catch (err: unknown) {
    console.error("Failed to create simulated incident:", err)
    return NextResponse.json({ error: "Failed to simulate incident" }, { status: 500 })
  }
}
