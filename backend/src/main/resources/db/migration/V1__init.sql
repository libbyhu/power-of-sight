-- 用眼睛發力 v0.8 初始資料表
-- 同一份 SQL 可以在 H2（本機）與 PostgreSQL（正式環境）執行。

-- 會員
create table users (
  id            uuid primary key,
  email         varchar(254) not null unique,
  password_hash varchar(100) not null,
  display_name  varchar(40)  not null,
  created_at    timestamp with time zone not null
);

-- 每位會員一間書房（一對一）
create table rooms (
  id           uuid primary key,
  owner_id     uuid not null unique references users(id) on delete cascade,
  name         varchar(60)  not null,
  intro        varchar(500),
  quote_text   varchar(200),
  quote_source varchar(100),
  is_public    boolean not null default false,  -- 預留：公開參觀尚未開放
  created_at   timestamp with time zone not null,
  updated_at   timestamp with time zone not null
);

-- 作品本身的資料（書名、作者...）
-- 目前每筆由新增它的會員建立；之後接外部搜尋（Google Books / TMDB）時，
-- 可用 external_source + external_id 讓多位會員共用同一部作品。
create table media_items (
  id              uuid primary key,
  type            varchar(10)  not null check (type in ('BOOK', 'MOVIE', 'TV', 'ANIME')),
  title           varchar(200) not null,
  original_title  varchar(200),
  creator         varchar(120),               -- 作者／導演／創作者／工作室，依 type 顯示不同標籤
  release_year    integer check (release_year between 1000 and 3000),
  cover_url       varchar(500),
  external_source varchar(30),
  external_id     varchar(100),
  created_by      uuid references users(id) on delete set null,
  created_at      timestamp with time zone not null
);

-- 會員自己的收藏紀錄：狀態、喜好、心得都可以不填
create table entries (
  id            uuid primary key,
  owner_id      uuid not null references users(id) on delete cascade,
  media_item_id uuid not null references media_items(id),
  status        varchar(12) check (status in ('WANT', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED')),
  preference    integer check (preference between 1 and 5),
  review        varchar(300),
  completed_on  date,
  display_order bigint not null,               -- 預留給之後的手動排序／拖曳擺放
  version       bigint not null default 0,     -- 樂觀鎖：防止舊畫面覆蓋新資料
  created_at    timestamp with time zone not null,
  updated_at    timestamp with time zone not null,
  unique (owner_id, media_item_id)
);

create index entries_owner_order_idx on entries (owner_id, display_order);
create index entries_owner_status_idx on entries (owner_id, status);
