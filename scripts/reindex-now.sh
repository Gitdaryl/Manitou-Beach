#!/bin/bash
# Rebuild the retrieval index now, instead of waiting for the 04:00 UTC cron.
#
#   bash scripts/reindex-now.sh
#
# Needs the admin token: the same one you type into /yeti-admin. It is read
# hidden and never written to disk or shell history.
#
# Afterwards it prints the index status. What you want to see is passages
# ABOVE ZERO and no "embedding failed" against any source.

set -u
printf 'Paste the admin token (the /yeti-admin one, input is hidden): '
read -rs TOKEN
echo; echo
[ -z "$TOKEN" ] && { echo "No token entered. Nothing run."; exit 1; }

SITE="https://manitoubeachmichigan.com"

echo "Rebuilding the index. This can take a minute or two..."
CODE=$(curl -s -o /tmp/reindex.out -w '%{http_code}' --max-time 600 \
  "$SITE/api/cron-reindex" -H "X-Admin-Token: $TOKEN")

if [ "$CODE" = "401" ]; then
  echo "  401 Unauthorized. That token is not the admin one. Nothing was changed."
  exit 1
fi
echo "  HTTP $CODE"
head -c 600 /tmp/reindex.out; echo; rm -f /tmp/reindex.out
echo
echo "=== index status now ==="
curl -s --max-time 30 "$SITE/api/retrieve?cb=$(date +%s)" | python3 -c '
import json,sys
s=json.load(sys.stdin)["status"]
print("  passages :", s.get("passages"))
print("  stale    :", s.get("stale"))
print("  indexedAt:", s.get("indexedAt"))
print("  sources  :")
for x in s.get("sources",[]):
    print("     ", x.get("source"), "->", x.get("error") or f"indexed {x.get(\"indexed\")}")
print("  embed calls by day:", s.get("embedCallsByDay"))
ok = (s.get("passages") or 0) > 0
print()
print("  RESULT:", "FIXED, the index has content" if ok else "STILL EMPTY, paste this back to Claude")
'
