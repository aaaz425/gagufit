---
name: feature
description: 기능 하나를 에이전트 팀으로 개발 - 계획 확인 1회, worktree 병렬 구현, 병합, 검증·리뷰, PR 초안까지. 로드맵 단계나 PRD 기능 구현 요청 시 사용
---

# feature

메인 세션이 PM 역할 - 직접 구현하지 않고 에이전트에 분배·병합·중계

## 1. 계획

- PRD·로드맵·관련 코드 확인 후 계획 작성
  - 목표, 범위 밖
  - 에이전트 구성과 이유 - 바뀌는 범위에 필요한 역할만, 많다고 낫지 않음
  - 에이전트별 작업, 순서와 병렬 여부
- 사용자 확인 - 이후 PR 초안까지 확인 없이 진행
- 계획에 없던 범위 변경이 생기면 그때만 다시 확인

## 2. 브랜치

- 원격 main 기준으로 생성 - 로컬 main 상태와 무관

```sh
git fetch origin
git switch -c feat/<이름> --no-track origin/main
```

## 3. 구현

- 타입이 바뀌면 core-dev 먼저 - web·api가 그 타입에 의존
- 서로 다른 패키지 작업은 병렬 - Agent `isolation: "worktree"`
- 에이전트에 전달할 것
  - 계획 중 해당 부분
  - 앞 단계 에이전트의 결과 보고
  - worktree 첫 작업으로 `pnpm install --frozen-lockfile`, `git log -1`로 `feat/*` 최신 커밋 기준인지 확인
- 의존성 추가는 해당 에이전트가 직접, lockfile 충돌은 병합 시 `pnpm install`로 재생성

## 4. 병합

- 각 worktree 브랜치를 `feat/*`에 병합, 충돌은 PM이 해결
- 에이전트 결과의 요청 사항(다른 패키지 수정 필요)은 담당 에이전트에 다시 분배
- 병합 후 `pnpm turbo run lint typecheck test build`

## 5. 검증·리뷰

- 계획에 넣은 검증·리뷰 에이전트 실행
- 실패·반드시 고칠 것은 담당 에이전트에 되돌림 - 최대 2회, 넘으면 사용자에게 보고
  - 2회째는 Agent `model: "opus"`로 실행 - 구현 에이전트는 기본 sonnet
- 제안 수준 지적은 PR 초안에 남기고 넘어감

## 6. 기록

- 되돌리기 어려운 구조 결정이 있었으면 `/adr`
- 로드맵 해당 단계 체크

## 7. PR

- `/pr` - 초안 확인 후 생성, 머지는 사용자
