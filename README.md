# gagufit

3D 방 배치 시뮬레이터 - [gagufit.com](https://gagufit.com)

## 시작

Node 26, pnpm 11, Docker, Supabase CLI 필요

```bash
pnpm install
supabase start
cp apps/web/.env.example apps/web/.env.local  # supabase status 값 입력
pnpm dev
```

## 명령어

| 명령어           | 내용          |
| ---------------- | ------------- |
| `pnpm dev`       | 개발 서버     |
| `pnpm build`     | 빌드          |
| `pnpm lint`      | ESLint        |
| `pnpm typecheck` | 타입 검사     |
| `pnpm test`      | 테스트        |
| `pnpm format`    | Prettier 적용 |

## 문서

- 작업 규칙 - [AGENTS.md](./AGENTS.md)
- 기획 - [docs/product](./docs/product)
- 주요 결정 - [docs/adr](./docs/adr)
- 배포 - [docs/deploy.md](./docs/deploy.md)
