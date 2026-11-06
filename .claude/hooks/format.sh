#!/bin/sh
# 수정한 파일에 Prettier 적용
file=$(jq -r '.tool_input.file_path // empty')
[ -n "$file" ] || exit 0
cd "$CLAUDE_PROJECT_DIR" && pnpm exec prettier --write --ignore-unknown --log-level silent "$file" || true
