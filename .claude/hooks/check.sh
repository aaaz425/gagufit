#!/bin/sh
# 끝내기 전 typecheck·test - 코드 변경 없으면 생략, 실패는 exit 2로 되돌려 고치게
cwd=$(jq -r '.cwd // empty')
cd "${cwd:-$CLAUDE_PROJECT_DIR}" || exit 0

changed=$(git status --porcelain 2>/dev/null | grep -vE '\.(md|pen)$| (docs|\.claude)/')
[ -n "$changed" ] || exit 0

out=$(pnpm turbo run typecheck test --output-logs=errors-only 2>&1) && exit 0
printf '%s\n' "$out" | tail -40 >&2
exit 2
