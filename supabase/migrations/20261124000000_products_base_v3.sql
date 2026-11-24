-- 저장 구조 v3 - 기본 프리셋 id 통일에 맞춰 상품 base 갱신
-- id는 그대로 - 방에 저장된 product.id가 깨지지 않음
update public.products set base = case base
  when 'bed-super-single' then 'bed'
  when 'desk-120' then 'desk'
  when 'sofa-2seat' then 'sofa'
  when 'dining-table-2' then 'dining-table'
  when 'wardrobe-90' then 'wardrobe'
  when 'drawer-80' then 'drawer'
  when 'bookshelf-80' then 'bookshelf'
  when 'hanger-100' then 'hanger'
  when 'tv-stand-150' then 'tv-stand'
  when 'rug-160' then 'rug'
  when 'etc-box' then 'etc'
  else base
end;
