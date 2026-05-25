#!/usr/bin/env bash
# =============================================================================
# scripts/inject-forgecad.sh
# =============================================================================
# Injects the Capstone AI Measurement Assistant into ForgeCAD's local dist.
# Run this once after `npm install -g forgecad` or `npm update -g forgecad`.
# It is idempotent — safe to run multiple times.
#
# Usage:  bash scripts/inject-forgecad.sh
# =============================================================================

set -euo pipefail

MARKER="ForgeCAD AI Measurement Assistant"
HARNESS_API="${FORGECAD_HARNESS_API:-http://localhost:8000}"

# Locate the installed forgecad package
FORGECAD_NPM_ROOT=$(npm root -g 2>/dev/null)
FORGECAD_DIST="${FORGECAD_NPM_ROOT}/forgecad/dist/index.html"

if [ ! -f "$FORGECAD_DIST" ]; then
  echo "❌  Could not find forgecad dist at: $FORGECAD_DIST"
  echo "   Make sure forgecad is installed globally: npm install -g forgecad"
  exit 1
fi

# Already injected?
if grep -q "$MARKER" "$FORGECAD_DIST" 2>/dev/null; then
  echo "✓  Already injected (skipping). To re-inject, remove the marker manually."
  echo "   File: $FORGECAD_DIST"
  exit 0
fi

# Create the injection snippet
INJECTION=$(cat <<EOF

    <!-- $MARKER — injected by Capstone harness (scripts/inject-forgecad.sh) -->
    <script>
      (function() {
        var API = '${HARNESS_API}';
        var s = document.createElement('script');
        s.src = API + '/forge-assistant.js?v=' + Date.now();
        s.async = true;
        s.setAttribute('data-forge-api', API);
        s.onerror = function() {
          console.debug('[ForgeAssistant] Harness API not running at ' + API + ' — assistant disabled.');
        };
        document.body.appendChild(s);
      })();
    </script>
EOF
)

# Backup original
cp "$FORGECAD_DIST" "${FORGECAD_DIST}.backup"

# Inject before </body>
python3 - "$FORGECAD_DIST" "$INJECTION" <<'PYEOF'
import sys, os

html_path = sys.argv[1]
injection = sys.argv[2]

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

if '</body>' not in html:
    print("❌  Could not find </body> tag in " + html_path)
    sys.exit(1)

html = html.replace('  </body>\n</html>', injection + '\n  </body>\n</html>', 1)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
PYEOF

echo "✅  Injected AI assistant into ForgeCAD dist."
echo "   API target: $HARNESS_API"
echo "   File:       $FORGECAD_DIST"
echo "   Backup:     ${FORGECAD_DIST}.backup"
