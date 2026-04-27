#!/usr/bin/env bash
# Weekly TSA UOM update notifier
# Scheduled via crontab: 0 9 * * 1  (every Monday at 09:00)
# Sends a push notification to Jake and prints the update prompt.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROMPT_FILE="$SCRIPT_DIR/weekly-update-prompt.md"
LOG_FILE="$SCRIPT_DIR/weekly-update.log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Weekly update notification triggered" >> "$LOG_FILE"

# Print the update prompt to stdout (visible in Claude Code session)
echo ""
echo "========================================================"
echo "  TSA UOM WEEKLY UPDATE — $(date '+%A, %B %d, %Y')"
echo "========================================================"
cat "$PROMPT_FILE"
echo ""
echo "========================================================"
echo "  Please provide your updates above, then Claude will"
echo "  apply them to the dashboard automatically."
echo "========================================================"
