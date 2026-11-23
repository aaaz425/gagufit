-- 판매처는 쿠팡 하나 - 한 줄에 링크 하나
-- 수정은 대시보드(service role)에서만 - 앱 역할에는 읽기만 허용
create table public.products (
  -- 저장된 방의 presetId로 남음 - 바꾸거나 지우지 말 것
  id text primary key,
  -- 코드 기본 프리셋 id - 분류·최소 크기·재질·기본색을 이어받음
  base text not null,
  name text not null,
  -- cm
  width int not null check (width > 0),
  depth int not null check (depth > 0),
  height int not null check (height > 0),
  -- 비우면 base 기본색
  color text,
  -- 쿠팡 파트너스 링크
  url text not null,
  -- 원 - 판매처 참고가
  price int not null check (price > 0),
  checked_at date not null
);

alter table public.products enable row level security;

create policy products_select on public.products
  for select to anon, authenticated using (true);

revoke all on public.products from anon, authenticated;
grant select on public.products to anon, authenticated;

insert into public.products
  (id, base, name, width, depth, height, color, url, price, checked_at)
values
  ('bed-gagutown-dw102-ss', 'bed-super-single', '가구타운 철제 DW102 슈퍼싱글 단층 침대', 118, 213, 87, 'charcoal', 'https://link.coupang.com/a/iRengjv68O', 209000, '2026-11-21'),
  ('desk-rockyhomes-gaming-1200', 'desk-120', '락키홈즈 게이밍 컴퓨터 책상 1200', 120, 60, 74, 'white', 'https://link.coupang.com/a/iRepDsNX6O', 45000, '2026-11-21'),
  ('chair-chairclub-m2', 'chair', '체어클럽 M2 헤더형 메쉬의자', 58, 58, 107, 'charcoal', 'https://link.coupang.com/a/iRexAMD0DY', 44900, '2026-11-21'),
  ('sofa-domo-poco-edge-2', 'sofa-2seat', '도모디자인 포코 엣지 2인 소파', 146, 84, 82, 'beige-fabric', 'https://link.coupang.com/a/iRerstbhF6', 169000, '2026-11-21'),
  ('dining-samik-dale-2', 'dining-table-2', '삼익가구 데일 2인용 원목 식탁', 85, 65, 74, 'oak', 'https://link.coupang.com/a/iReAShdNTM', 69000, '2026-11-21'),
  ('wardrobe-somssibang-simple', 'wardrobe-90', '솜씨방가구 심플장롱 투서랍장', 81, 58, 187, 'white', 'https://link.coupang.com/a/iReCPqgp2a', 104900, '2026-11-21'),
  ('drawer-comet-slim-5', 'drawer-80', '코멧 국내생산 모던 슬림서랍장 5단', 31, 40, 98, 'white', 'https://link.coupang.com/a/iReGju4NTE', 20970, '2026-11-21'),
  ('bookshelf-samik-teddy-1200-5', 'bookshelf-80', '삼익가구 테디 1200 5단 책장 A타입', 120, 28, 200, 'white', 'https://link.coupang.com/a/iRejWCgToy', 62900, '2026-11-21'),
  ('hanger-comet-basic-stand', 'hanger-100', '코멧 홈 베이직 스탠드 행거', 105, 37, 155, 'white', 'https://link.coupang.com/a/iResVN8NzM', 11290, '2026-11-21'),
  ('tv-stand-jd-remi-1200', 'tv-stand-150', '제이디퍼니처 레미 거실장', 120, 30, 30, 'white', 'https://link.coupang.com/a/iReHWqvVpk', 52500, '2026-11-21'),
  ('nightstand-comet-basic-2', 'nightstand', '코멧 홈 베이직 2단 서랍 협탁', 40, 30, 41, 'white', 'https://link.coupang.com/a/iReLogn5JQ', 20890, '2026-11-21'),
  ('dressing-apex-amitie-600', 'dressing-table', 'apex 아미띠에 입식 화장대 600', 60, 40, 73, 'white', 'https://link.coupang.com/a/iReQezsRIy', 37630, '2026-11-21'),
  ('fridge-lucoms-157l', 'fridge', '루컴즈 157L 2도어 냉장고', 47, 50, 144, 'white', 'https://link.coupang.com/a/iReRgI4Z9o', 274120, '2026-11-21'),
  ('washer-samsung-wa16cg6441by', 'washer', '삼성전자 그랑데 통버블 세탁기 16kg', 64, 70, 109, 'grey', 'https://link.coupang.com/a/iRfHNRzvGK', 498580, '2026-11-21'),
  ('rug-ongyeol-washable-200x400', 'rug-160', '온결 워셔블 단모 사각 러그 200x400', 200, 400, 1, 'beige-fabric', 'https://link.coupang.com/a/iReXm4MFAO', 118380, '2026-11-21');
