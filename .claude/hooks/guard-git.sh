#!/bin/sh
# main 커밋·푸시, PR 머지 차단
input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')
cwd=$(printf '%s' "$input" | jq -r '.cwd // empty')
branch=$(git -C "${cwd:-.}" branch --show-current 2>/dev/null)

block() { echo "$1" >&2; exit 2; }

case "$cmd" in
  *"gh pr merge"*) block "PR 머지는 사용자만" ;;
esac

if printf '%s' "$cmd" | grep -Eq 'git( -C [^ ]+)? (commit|push)'; then
  [ "$branch" = "main" ] && block "main에서 커밋·푸시 금지 - feat/* fix/* chore/* 브랜치 사용"
  printf '%s' "$cmd" | grep -Eq 'git( -C [^ ]+)? push.*([ :]main( |$))' && block "main으로 푸시 금지"
fi
exit 0
