# 배포

Supabase 운영 프로젝트 + Vercel + gagufit.com
"직접" = 사용자가 대시보드·콘솔에서 할 일, 나머지는 저장소에 이미 있음

## 순서

1. Supabase 운영 프로젝트 생성 - 직접
   - 리전 Northeast Asia (Seoul) `ap-northeast-2`
   - DB 비밀번호는 비밀번호 관리자에 보관, 저장소 커밋 금지
2. 프로젝트 연결 - 직접
   - `supabase login` → `supabase link --project-ref <ref>`
3. 마이그레이션 적용
   - `supabase projects list`로 LINKED 표시가 운영 프로젝트 ref인지 먼저 확인 (이 PC의 CLI는 다른 ref에 link돼 있을 수 있음)
   - `supabase db push`
   - `supabase/migrations`의 SQL만 적용, 대시보드에서 스키마 수정 금지
   - pg_cron 확장은 마이그레이션이 켬 (`20261109000001_cleanup_anonymous_users.sql`)
4. 운영 Auth 설정 - 직접, 대시보드
   - Authentication > Sign In / Providers > Allow anonymous sign-ins 켜기
   - Authentication > URL Configuration
     - Site URL `https://gagufit.com`
     - Redirect URLs `https://gagufit.com/**`
   - 대시보드를 고른 이유
     - `supabase config push`는 `config.toml`의 auth 전체를 운영에 덮어씀 (rate limit·이메일 등 포함)
     - `config.toml`은 로컬 값(127.0.0.1)이라 `[remotes.*]` 오버라이드·`env()` 치환을 따로 관리해야 함
     - 바꿀 값이 3개뿐이라 대시보드가 단순하고 안전
5. Vercel 프로젝트 연결 - 직접
   - GitHub 저장소 import
   - Root Directory `apps/web`
   - Framework Next.js, Install·Build 명령은 기본값 (루트 밖 소스 포함 옵션 켜진 상태 유지)
   - pnpm 버전 확인 - Vercel은 lockfile 버전으로 pnpm 주 버전을 고르는 것으로 알려짐, `packageManager`의 정확한 버전은 `ENABLE_EXPERIMENTAL_COREPACK=1`일 때 따르는 것으로 알려짐
   - 첫 빌드 로그에서 pnpm 11이 쓰였는지 확인, 아니면 환경변수 표의 `ENABLE_EXPERIMENTAL_COREPACK` 추가 (pnpm 11 설정이 무시될 수 있음)
   - Node.js Version은 `engines`(>=26)에 맞는 값이 선택 가능한지 확인
6. 함수 리전 서울 - 직접
   - Settings > Functions > Function Region `Seoul, South Korea (icn1)`
   - `vercel.json` 추가 없이 대시보드로만 지정
7. 환경변수 - 직접
   - Settings > Environment Variables, Production에 입력
   - `NEXT_PUBLIC_*`는 빌드 때 박힘 - 값 변경 시 재배포
8. 도메인 - 직접
   - Settings > Domains에 `gagufit.com`과 `www.gagufit.com` 추가
   - `www.gagufit.com`은 `gagufit.com`으로 리다이렉트 설정
   - 등록기관 DNS에 Vercel이 안내하는 레코드 입력 (apex A, `www` CNAME)
9. 배포 후 확인
   - `https://gagufit.com` 접속, `www`는 apex로 이동, `/privacy` `/terms` 열림
   - 방 만들기 → 새로고침 후 자동 저장 유지, `/rooms` 목록 표시
   - Supabase 대시보드 Authentication > Users에 익명 사용자 생성
   - Database > Cron Jobs에 `delete-stale-anonymous-users` 등록

## 환경변수

| 이름                                   | 값 출처                                              | 비고                               |
| -------------------------------------- | ---------------------------------------------------- | ---------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase > Project Settings > API > Project URL      | 로컬은 `supabase status`           |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase > Project Settings > API Keys > Publishable | secret·service_role 키는 넣지 않음 |
| `ENABLE_EXPERIMENTAL_COREPACK`         | 값 `1`, Vercel 환경변수                              | 선택, pnpm 버전이 안 맞을 때만     |
| `NEXT_PUBLIC_SITE_URL`                 | `https://gagufit.com`                                | 선택, 기본값 같음                  |

## Vercel 없이 실행

```bash
pnpm install --frozen-lockfile
pnpm --filter @gagufit/web build
pnpm --filter @gagufit/web start   # PORT=3000 기본, 환경변수는 build 전에 설정
```

- Node 서버로 동작, Vercel 전용 기능 없음 (`vercel.json`·Edge 런타임·`@vercel/*` 미사용)
- 이전 시 DB는 Supabase 그대로, 웹만 옮기면 됨

## 정리 작업

- 익명 계정은 마지막 활동 90일 후 매일 03:00 KST에 삭제 (방 포함)
- 활동 기준은 세션 갱신 시각과 마지막 로그인 중 최근 값
