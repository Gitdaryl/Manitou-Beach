#!/bin/bash
# Find out why the retrieval index is empty.
#
#   bash scripts/test-embeddings.sh
#
# The daily reindex cron runs, writes a fresh timestamp, and indexes zero
# passages. Every source reports "embedding failed" and there have been no
# successful embedding calls in seven days. GEMINI_API_KEY is set in Vercel
# production but marked Sensitive, so it cannot be read back to test.
#
# Two candidates, and they need opposite fixes:
#   a) the key is dead, revoked, or out of quota   -> replace the key
#   b) text-embedding-004 has been retired          -> one line in api/lib/embeddings.js
#
# This tells you which. Make a fresh key at https://aistudio.google.com/apikey
# The key is read hidden and never written to disk or shell history.

set -u
printf 'Paste a Gemini API key (input is hidden), then press return: '
read -rs KEY
echo; echo

if [ -z "$KEY" ]; then echo "No key entered. Nothing tested."; exit 1; fi

test_model () {
  printf '  %-24s ' "$1"
  BODY=$(curl -s --max-time 25 -X POST \
    "https://generativelanguage.googleapis.com/v1beta/models/$1:embedContent?key=$KEY" \
    -H 'Content-Type: application/json' \
    -d "{\"model\":\"models/$1\",\"content\":{\"parts\":[{\"text\":\"manitou beach\"}]},\"outputDimensionality\":256}")
  if printf '%s' "$BODY" | grep -q '"values"'; then
    echo "WORKS"
  else
    echo "FAILS"
    printf '%s' "$BODY" | python3 -c 'import json,sys
try:
    e=json.load(sys.stdin).get("error",{})
    print("      ",e.get("code"),e.get("status"),"-",str(e.get("message"))[:150])
except Exception: print("      unparseable response")'
  fi
}

echo "Testing the model the code uses, then its replacement:"
test_model "text-embedding-004"
test_model "gemini-embedding-001"

echo
echo "How to read this:"
echo "  both WORK          -> the key in Vercel is the problem. Replace GEMINI_API_KEY."
echo "  004 FAILS, 001 OK  -> the model is retired. One line to change in api/lib/embeddings.js."
echo "  both FAIL          -> this key is bad too. Check billing and quota in Google AI Studio."
echo
