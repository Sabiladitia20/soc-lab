import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const rules = [
  {
    ruleCode: "RULE-001",
    name: "SQL Injection Attempt",
    description: "Mendeteksi pola SQL injection umum di parameter URL",
    severity: "High",
    mitreTechnique: "T1190",
    matchField: "url",
    pattern:
      "(\\%27)|(')|(\\-\\-)|(\\%23)|(#)|(\\bOR\\b.{1,20}=)|(\\bUNION\\b.{1,20}\\bSELECT\\b)",
    thresholdCount: 1,
    thresholdWindowSeconds: 0,
  },
  {
    ruleCode: "RULE-002",
    name: "Brute Force Login Attempt",
    description: "Multiple percobaan login gagal dari IP yang sama",
    severity: "Medium",
    mitreTechnique: "T1110",
    matchField: "log_line",
    pattern: "(POST|GET) /rest/user/login.*(401|403)",
    thresholdCount: 5,
    thresholdWindowSeconds: 60,
  },
  {
    ruleCode: "RULE-003",
    name: "Cross-Site Scripting (XSS) Attempt",
    description: "Mendeteksi pola script injection di parameter URL",
    severity: "High",
    mitreTechnique: "T1059.007",
    matchField: "url",
    pattern:
      "(<script)|(%3Cscript)|(onerror\\s*=)|(onload\\s*=)|(javascript:)",
    thresholdCount: 1,
    thresholdWindowSeconds: 0,
  },
  {
    ruleCode: "RULE-004",
    name: "Directory Traversal Attempt",
    description: "Mendeteksi pola path traversal",
    severity: "High",
    mitreTechnique: "T1083",
    matchField: "url",
    pattern: "(\\.\\./)|(\\.\\.%2f)|(etc/passwd)|(win.ini)|(boot.ini)",
    thresholdCount: 1,
    thresholdWindowSeconds: 0,
  },
  {
    ruleCode: "RULE-005",
    name: "Suspicious Scanner User-Agent",
    description: "Mendeteksi User-Agent tools pentest/scanning",
    severity: "Medium",
    mitreTechnique: "T1595",
    matchField: "user_agent",
    pattern:
      "(sqlmap)|(nikto)|(nmap)|(nessus)|(acunetix)|(burpsuite)|(dirbuster)|(gobuster)",
    thresholdCount: 1,
    thresholdWindowSeconds: 0,
  },
  {
    ruleCode: "RULE-006",
    name: "Admin Path Enumeration",
    description: "Banyak percobaan akses path administratif",
    severity: "Medium",
    mitreTechnique: "T1595.003",
    matchField: "url",
    pattern:
      "(/admin)|(/wp-admin)|(/administrator)|(/manage)|(/console)|(/phpmyadmin)",
    thresholdCount: 3,
    thresholdWindowSeconds: 30,
  },
]

async function main() {
  console.log("🔧 Seeding detection rules...")

  for (const rule of rules) {
    const result = await prisma.rule.upsert({
      where: { ruleCode: rule.ruleCode },
      update: {
        name: rule.name,
        description: rule.description,
        severity: rule.severity,
        mitreTechnique: rule.mitreTechnique,
        matchField: rule.matchField,
        pattern: rule.pattern,
        thresholdCount: rule.thresholdCount,
        thresholdWindowSeconds: rule.thresholdWindowSeconds,
      },
      create: rule,
    })
    console.log(`  ✅ ${result.ruleCode} — ${result.name}`)
  }

  console.log(`\n🎉 Seeded ${rules.length} rules successfully.`)
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
