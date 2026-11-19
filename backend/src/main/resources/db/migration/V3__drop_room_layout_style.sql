-- 書房擺放風格（兩扇門）的設計已取消：書房只有一種呈現方式，
-- 種類與狀態以篩選處理。V2 新增的欄位與限制一併移除。
alter table rooms drop constraint rooms_layout_style_chk;
alter table rooms drop column layout_style;
