---
name: pr
description: PR 초안 작성 후 사용자 확인을 받아 생성 - 기능·작업 브랜치를 main에 올릴 때 사용. 머지는 하지 않음
---

# pr

## 1. 확인

- `pnpm format:check` 통과
- `pnpm turbo run lint typecheck test build` 통과 - `*.md`·`.claude`·`docs`만 바뀌었으면 생략
- 커밋 안 된 변경 없음

## 2. 초안

- 제목: Conventional Commits, 범위는 패키지명, 한국어
- 본문: `.github/pull_request_template.md` 형식
  - 템플릿 섹션만 - 메모·주의사항 등 섹션 추가 금지
  - 요약 - 짧은 한 구절
  - 변경 - 기능별 짧은 명사형 한 줄, 원인·세부 동작·파일 경로 없이
  - 확인 - 실제로 통과한 것만 체크
  - 보여주기 전 한 번 더 줄이기
- 제목·본문을 사용자에게 보여주고 확인 받기

## 3. 생성

- 확인 후에만 push와 `gh pr create`
- 머지 금지 - 사용자가 검토 후 직접
