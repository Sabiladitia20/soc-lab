$directories = @(
    "app/(marketing)",
    "app/learn/[slug]",
    "app/simulator/phishing",
    "app/simulator/quiz",
    "app/simulator/checker",
    "app/dashboard/incidents",
    "app/dashboard/mitre",
    "app/dashboard/threat-map",
    "app/assistant",
    "app/about",
    "app/settings",
    "components/layout",
    "components/dashboard",
    "lib",
    "prisma"
)

foreach ($dir in $directories) {
    if (-Not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
}

$files = @(
    "app/(marketing)/page.tsx",
    "app/learn/page.tsx",
    "app/learn/[slug]/page.tsx",
    "app/simulator/phishing/page.tsx",
    "app/simulator/quiz/page.tsx",
    "app/simulator/checker/page.tsx",
    "app/dashboard/page.tsx",
    "app/dashboard/incidents/page.tsx",
    "app/dashboard/mitre/page.tsx",
    "app/dashboard/threat-map/page.tsx",
    "app/assistant/page.tsx",
    "app/about/page.tsx",
    "app/settings/page.tsx",
    "components/layout/sidebar.tsx",
    "components/layout/sidebar-section.tsx",
    "components/layout/topbar.tsx",
    "components/dashboard/stat-card.tsx",
    "components/dashboard/incident-table.tsx",
    "components/dashboard/severity-badge.tsx",
    "components/dashboard/status-badge.tsx",
    "components/dashboard/sla-badge.tsx",
    "lib/mock-data.ts",
    "prisma/schema.prisma"
)

foreach ($file in $files) {
    if (-Not (Test-Path $file)) {
        New-Item -ItemType File -Force -Path $file | Out-Null
        Set-Content -Path $file -Value "// $file"
    }
}
Write-Host "Directory structure created successfully."
