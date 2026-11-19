# 03 API 規格

所有路徑都以 `/api` 開頭。除了註冊、登入、登出與 health，其餘都需要登入 cookie（`pos_token`），也接受 `Authorization: Bearer <JWT>` 方便用 curl 測試。

列舉值一律大寫：`type` = `BOOK | MOVIE | TV | ANIME`；`status` = `WANT | IN_PROGRESS | COMPLETED | ABANDONED`。

## 會員

| 方法 | 路徑 | 說明 | 成功 |
|---|---|---|---|
| POST | /api/auth/register | `{ email, password(8–72), displayName }`，同時建立書房並登入 | 201 + Set-Cookie |
| POST | /api/auth/login | `{ email, password }` | 200 + Set-Cookie |
| POST | /api/auth/logout | 清除 cookie | 204 |
| GET | /api/auth/me | 目前登入者 | 200 `{ id, email, displayName }` |

## 書房

| 方法 | 路徑 | 說明 |
|---|---|---|
| GET | /api/me/room | `{ name, intro, quoteText, quoteSource, layoutStyle, isPublic, updatedAt }`；`layoutStyle` 為 null 代表還沒選門 |
| PUT | /api/me/room | `{ name, intro?, quoteText?, quoteSource? }`，整份取代（不影響選好的門） |
| PUT | /api/me/room/layout | `{ layoutStyle: "TIDY" \| "ARTISTIC" }`，選門或換門 |
| GET | /api/me/room/stats | `{ total, byType: { BOOK: 2, … }, byStatus: { WANT: 1, NONE: 3, … } }` |

## 收藏

| 方法 | 路徑 | 說明 | 成功 |
|---|---|---|---|
| GET | /api/me/entries | 篩選參數都選填：`type`、`status`、`q`（搜尋名稱／原文名／作者）、`sort`（`RECENT` 最新在前，預設；`TITLE` 依種類、名稱）、`page`（0 起）、`size`（1–100，預設 24） | 200 分頁 |
| GET | /api/me/entries/{id} | 單筆 | 200 |
| POST | /api/me/entries | 新增 | 201 + Location |
| PUT | /api/me/entries/{id} | 修改，**必須帶 `version`** | 200（version +1） |
| DELETE | /api/me/entries/{id} | 移除 | 204 |

新增／修改的內容：

```json
{
  "type": "BOOK",
  "title": "挪威的森林",
  "originalTitle": "ノルウェイの森",
  "creator": "村上春樹",
  "releaseYear": 1987,
  "coverUrl": null,
  "status": "COMPLETED",
  "preference": 5,
  "review": "很安靜的一本書",
  "completedOn": "2026-10-01",
  "version": 0
}
```

只有 `type`、`title` 必填。不認得的欄位（例如偷塞 `ownerId`）會回 400。

分頁回應：

```json
{ "items": [ … ], "page": 0, "size": 24, "totalItems": 3, "totalPages": 1 }
```

## 錯誤格式

```json
{ "code": "VALIDATION_FAILED", "message": "Some fields are invalid", "fields": { "review": "size must be between 0 and 300" } }
```

| HTTP | code | 何時 |
|---|---|---|
| 400 | VALIDATION_FAILED | 欄位驗證失敗，`fields` 說明是哪些 |
| 400 | BAD_REQUEST | JSON 格式錯、未知欄位、不明的 type、分頁超出範圍 |
| 400 | VERSION_REQUIRED | 修改時沒帶 version |
| 401 | UNAUTHORIZED | 沒登入、token 過期或被竄改 |
| 401 | INVALID_CREDENTIALS | 帳號或密碼錯（不區分是哪一個錯） |
| 404 | NOT_FOUND | 找不到，**包含「這是別人的收藏」** |
| 409 | EMAIL_TAKEN | Email 已註冊 |
| 409 | VERSION_CONFLICT | 用舊的 version 修改 |

前端依 `code` 顯示中文或英文訊息（`frontend/messages/*.json` 的 `errors`）。
