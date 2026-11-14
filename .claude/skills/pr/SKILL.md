---
name: pr
description: PR 바로 생성 후 링크·본문 보고 - 기능·작업 브랜치를 main에 올릴 때 사용. 머지는 하지 않음
---

# pr

## 1. 확인

- `pnpm format:check` 통과
- `pnpm turbo run lint typecheck test build` 통과 - `*.md`·`.claude`·`docs`만 바뀌었으면 생략
- 커밋 안 된 변경 없음

## 2. 본문

- 제목: Conventional Commits, 범위는 패키지명, 한국어
- 본문: `.github/pull_request_template.md` 형식
  - 템플릿 섹션만 - 메모·주의사항 등 섹션 추가 금지
  - 요약 - 짧은 한 구절
  - 변경 - 기능별 짧은 명사형 한 줄, 원인·세부 동작·파일 경로 없이
  - 확인 - 실제로 통과한 것만 체크
  - 올리기 전 한 번 더 줄이기

## 3. 생성

- 1단계 통과 후 바로 push와 `gh pr create`
- 링크와 제목·본문 보고 - 수정 요청은 `gh pr edit`로 반영
- 머지 금지 - 사용자가 검토 후 직접
