import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { campaignId: string; targetId: string } }
) {
  const { campaignId, targetId } = await params

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { landingPage: true },
  })

  if (!campaign) {
    return new NextResponse("Campaign not found", { status: 404 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:3001`
  const submitUrl = `${baseUrl}/api/track/submit/${campaignId}/${targetId}`
  const awarenessUrl = `${baseUrl}/lp/${campaignId}/${targetId}/awareness`

  // Script that:
  // 1. Intercepts all form submissions & standalone button clicks
  // 2. Captures all input field values
  // 3. POSTs captured data to our tracking API
  // 4. Redirects to awareness page
  const injectedScript = `
<script>
(function() {
  var SUBMIT_URL = '${submitUrl}';
  var AWARENESS_URL = '${awarenessUrl}';

  function gatherInputs(root) {
    var data = {};
    var inputs = (root || document).querySelectorAll('input, select, textarea');
    inputs.forEach(function(el) {
      if (el.type === 'submit' || el.type === 'button' || el.type === 'hidden') return;
      var key = el.name || el.id || el.placeholder || el.type || ('field_' + Math.random().toString(36).substr(2,5));
      data[key] = el.value;
    });
    return data;
  }

  function sendAndRedirect(data) {
    fetch(SUBMIT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      keepalive: true
    }).finally(function() {
      window.location.href = AWARENESS_URL;
    });
  }

  function attachListeners() {
    // Intercept all <form> submissions
    document.querySelectorAll('form').forEach(function(form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        sendAndRedirect(gatherInputs(form));
      }, true);
    });

    // Intercept all buttons / links NOT inside a form
    var selectors = 'button, input[type="submit"], input[type="button"], a[class*="btn"], [class*="btn"], [role="button"]';
    document.querySelectorAll(selectors).forEach(function(el) {
      if (el.closest('form')) return; // already handled by form listener
      el.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        sendAndRedirect(gatherInputs(document));
      }, true);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachListeners);
  } else {
    attachListeners();
  }
})();
</script>
`

  let html = campaign.landingPage.htmlContent

  // Inject before </body>, or append at end
  if (html.includes("</body>")) {
    html = html.replace("</body>", injectedScript + "</body>")
  } else {
    html = html + injectedScript
  }

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  })
}
