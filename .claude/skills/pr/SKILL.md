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
  - 요약 - 한 줄
  - 변경 - 핵심만, 파일 경로 나열·부연 없이
  - 확인 - 실제로 통과한 것만 체크
  - reviewer 제안 중 반영 안 한 것이 있으면 한 줄씩
- 제목·본문을 사용자에게 보여주고 확인 받기

## 3. 생성

- 확인 후에만 push와 `gh pr create`
- 머지 금지 - 사용자가 검토 후 직접
