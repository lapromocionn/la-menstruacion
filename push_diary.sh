#!/usr/bin/env bash
# Sync src/diary/ → github.com/lapromocionn/diary
# Usage: ./push_diary.sh [mensaje]
set -e

DIARY_SRC="$(dirname "$0")/src/diary"
DIARY_REMOTE="https://github.com/lapromocionn/diary.git"
TMPDIR_CLONE="$(mktemp -d)"
MSG="${1:-Auto-sync from proyecto-conjunto}"

echo "→ Clonando diary remote…"
git clone --quiet "$DIARY_REMOTE" "$TMPDIR_CLONE"

echo "→ Copiando archivos desde src/diary/…"
find "$TMPDIR_CLONE" -maxdepth 1 -not -name '.git' -not -path "$TMPDIR_CLONE" -exec rm -rf {} +
cp -r "$DIARY_SRC"/. "$TMPDIR_CLONE/"

cd "$TMPDIR_CLONE"
if git diff --quiet && git diff --cached --quiet; then
  echo "✓ Sin cambios — diary ya está al día"
else
  git add -A
  git commit -m "$MSG

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
  git push origin main
  echo "✓ Pusheado a diary/main"
fi

rm -rf "$TMPDIR_CLONE"
