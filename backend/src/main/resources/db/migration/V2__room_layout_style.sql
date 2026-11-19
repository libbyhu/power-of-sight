-- 兩扇門：書房的擺放風格。
-- NULL = 還沒選過門（第一次進書房會看到選門畫面）
-- TIDY = 整齊書架；ARTISTIC = 散落書房。隨時可以換，收藏資料不受影響。
alter table rooms add column layout_style varchar(10);
alter table rooms add constraint rooms_layout_style_chk check (layout_style in ('TIDY', 'ARTISTIC'));
