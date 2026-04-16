# SocialHub — RESTful API

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Authentication](#2-authentication)
3. [Users](#3-users)
4. [Posts](#4-posts)
5. [Comments](#5-comments)
6. [Likes](#6-likes)
7. [Follow](#7-follow)
8. [Notifications](#8-notifications)
9. [Messages](#9-messages)
10. [Bookmarks](#10-bookmarks)
11. [Block](#11-block)
12. [Reports](#12-reports)
13. [Search](#13-search)
14. [Hashtags](#14-hashtags)
15. [Preferences](#15-preferences)
16. [Analytics](#16-analytics)
17. [HTTP Status Codes](#17-http-status-codes)
18. [Error Response Format](#18-error-response-format)

---

## 1. Tổng quan

### Base URL
```
http://localhost:3000/api
```

### Authentication
- JWT token được lưu trong `HttpOnly` cookie tên `auth_token`
- Các endpoint yêu cầu auth gửi kèm cookie tự động (trình duyệt)
- Với client khác, truyền cookie trong request header

### Content-Type
```
Content-Type: application/json
```

### Request Body Format
Tất cả request body gửi dưới dạng JSON.

---

## 2. Authentication

### `POST /auth/register` — Đăng ký tài khoản mới

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "name": "Họ và tên"
}
```

| Field | Type | Required | Validation |
|---|---|---|---|
| email | string | ✅ | Email hợp lệ, duy nhất |
| username | string | ✅ | 3–20 ký tự, duy nhất |
| password | string | ✅ | Tối thiểu 8 ký tự |
| name | string | ✅ | 1–50 ký tự |

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "1",
    "email": "user@example.com",
    "username": "username",
    "name": "Họ và tên"
  }
}
```

**Errors:**
- `400` — Dữ liệu không hợp lệ
- `409` — Email hoặc username đã tồn tại

---

### `POST /auth/login` — Đăng nhập

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "1",
    "email": "user@example.com",
    "username": "username",
    "name": "Họ và tên"
  }
}
```

Set cookie: `auth_token` (HttpOnly, 7 ngày)

**Errors:**
- `400` — Dữ liệu không hợp lệ
- `401` — Sai email hoặc mật khẩu

---

### `POST /auth/logout` — Đăng xuất

**Response (200):**
```json
{
  "success": true
}
```
Xóa cookie `auth_token`.

---

### `GET /auth/me` — Lấy thông tin user hiện tại

**Auth:** ✅ Required

**Response (200):**
```json
{
  "id": "1",
  "email": "user@example.com",
  "username": "username",
  "name": "Họ và tên",
  "avatar": "https://...",
  "bio": "Tiểu sử",
  "theme": "light"
}
```

**Errors:**
- `401` — Chưa đăng nhập / Token không hợp lệ

---

### `PUT /auth/profile` — Cập nhật hồ sơ

**Auth:** ✅ Required

**Request Body:**
```json
{
  "name": "Tên mới",
  "bio": "Tiểu sử mới"
}
```

**Response (200):**
```json
{
  "id": "1",
  "email": "user@example.com",
  "username": "username",
  "name": "Tên mới",
  "bio": "Tiểu sử mới",
  "avatar": "https://..."
}
```

**Errors:**
- `400` — Dữ liệu không hợp lệ
- `401` — Chưa đăng nhập

---

## 3. Users

### `GET /users/:username` — Lấy thông tin user

**Auth:** Optional

**Response (200):**
```json
{
  "id": "1",
  "email": "user@example.com",
  "username": "username",
  "name": "Họ và tên",
  "bio": "Tiểu sử",
  "avatar": "https://...",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "followers": 42,
  "following": 15
}
```

**Errors:**
- `404` — User không tồn tại

---

### `GET /users/:username/posts` — Lấy bài viết của user

**Response (200):** Mảng posts (xem mục Posts)

---

### `GET /users/search?q=query` — Tìm kiếm user

**Query Params:**

| Param | Type | Required | Description |
|---|---|---|---|
| q | string | ✅ | Từ khóa tìm kiếm (≥2 ký tự) |

**Response (200):**
```json
[
  {
    "id": "1",
    "name": "Họ và tên",
    "username": "username",
    "avatar": "https://...",
    "bio": "Tiểu sử"
  }
]
```

---

## 4. Posts

### `GET /posts` — Lấy danh sách bài viết

**Response (200):**
```json
[
  {
    "id": "1",
    "userId": "1",
    "content": "Nội dung bài viết",
    "image": "https://...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "author": {
      "id": "1",
      "name": "Họ và tên",
      "username": "username",
      "avatar": "https://..."
    }
  }
]
```

---

### `POST /posts` — Tạo bài viết mới

**Auth:** ✅ Required

**Request Body:**
```json
{
  "content": "Nội dung bài viết",
  "image": "https://..."  // optional
}
```

| Field | Type | Required | Validation |
|---|---|---|---|
| content | string | ✅ | 1–500 ký tự |
| image | string | ❌ | URL ảnh |

**Response (201):** Trả về bài viết vừa tạo.

**Errors:**
- `400` — Dữ liệu không hợp lệ
- `401` — Chưa đăng nhập

---

### `GET /posts/:id` — Lấy chi tiết bài viết

**Response (200):** Trả về 1 bài viết.

**Errors:**
- `404` — Bài viết không tồn tại

---

### `PUT /posts/:id/edit` — Chỉnh sửa bài viết

**Auth:** ✅ Required (chỉ author mới được sửa)

**Request Body:**
```json
{
  "content": "Nội dung mới",
  "image": "https://..."  // optional
}
```

**Response (200):** Trả về bài viết đã cập nhật.

**Errors:**
- `400` — Dữ liệu không hợp lệ
- `401` — Chưa đăng nhập
- `403` — Không có quyền sửa
- `404` — Bài viết không tồn tại

---

### `DELETE /posts/:id` — Xóa bài viết

**Auth:** ✅ Required (chỉ author mới được xóa)

**Response (200):**
```json
{
  "success": true
}
```

**Errors:**
- `401` — Chưa đăng nhập
- `403` — Không có quyền xóa
- `404` — Bài viết không tồn tại

---

## 5. Comments

### `GET /posts/:id/comments` — Lấy bình luận của bài viết

**Response (200):**
```json
[
  {
    "id": "1",
    "userId": "2",
    "postId": "1",
    "content": "Nội dung bình luận",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### `POST /posts/:id/comments` — Thêm bình luận

**Auth:** ✅ Required

**Request Body:**
```json
{
  "content": "Nội dung bình luận"
}
```

| Field | Type | Required | Validation |
|---|---|---|---|
| content | string | ✅ | 1–300 ký tự |

**Response (201):** Trả về bình luận vừa tạo.

**Errors:**
- `400` — Dữ liệu không hợp lệ
- `401` — Chưa đăng nhập
- `404` — Bài viết không tồn tại

---

### `DELETE /comments/:id` — Xóa bình luận

**Auth:** ✅ Required (comment author hoặc post owner mới được xóa)

**Response (200):**
```json
{
  "success": true
}
```

**Errors:**
- `401` — Chưa đăng nhập
- `403` — Không có quyền xóa
- `404` — Bình luận không tồn tại

---

## 6. Likes

### `GET /posts/:id/likes` — Lấy số lượt thích

**Response (200):**
```json
{
  "likeCount": 42,
  "liked": true
}
```
`liked` = true nếu user hiện tại đã thích bài viết.

---

### `POST /posts/:id/likes` — Thích bài viết

**Auth:** ✅ Required

**Response (200):**
```json
{
  "likeCount": 43
}
```

**Errors:**
- `400` — Đã thích rồi
- `401` — Chưa đăng nhập
- `404` — Bài viết không tồn tại

---

### `DELETE /posts/:id/likes` — Bỏ thích bài viết

**Auth:** ✅ Required

**Response (200):**
```json
{
  "likeCount": 42
}
```

**Errors:**
- `400` — Chưa thích bài viết này
- `401` — Chưa đăng nhập

---

## 7. Follow

### `GET /users/:username/follow` — Kiểm tra trạng thái theo dõi

**Auth:** Optional

**Response (200):**
```json
{
  "following": true
}
```

---

### `POST /users/:username/follow` — Theo dõi user

**Auth:** ✅ Required

**Response (200):**
```json
{
  "success": true
}
```

**Errors:**
- `400` — Đã theo dõi / Không thể tự theo dõi mình
- `401` — Chưa đăng nhập
- `404` — User không tồn tại

---

### `DELETE /users/:username/follow` — Hủy theo dõi

**Auth:** ✅ Required

**Response (200):**
```json
{
  "success": true
}
```

**Errors:**
- `400` — Chưa theo dõi user này
- `401` — Chưa đăng nhập

---

## 8. Notifications

### `GET /notifications` — Lấy danh sách thông báo

**Auth:** ✅ Required

**Response (200):**
```json
{
  "notifications": [
    {
      "id": "1",
      "userId": "1",
      "type": "like",
      "actorId": "2",
      "postId": "1",
      "content": null,
      "read": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "unreadCount": 3
}
```

### `POST /notifications` — Đánh dấu tất cả đã đọc

**Auth:** ✅ Required

**Request Body:**
```json
{
  "action": "mark_all_read"
}
```

**Response (200):**
```json
{
  "success": true
}
```

---

### `PUT /notifications/:id` — Đánh dấu 1 thông báo đã đọc

**Auth:** ✅ Required

**Response (200):**
```json
{
  "success": true
}
```

---

## 9. Messages

### `GET /messages` — Lấy danh sách cuộc trò chuyện

**Auth:** ✅ Required

**Response (200):**
```json
{
  "conversations": [
    {
      "userId": "2",
      "lastMessage": {
        "id": "1",
        "senderId": "1",
        "receiverId": "2",
        "content": "Tin nhắn cuối cùng",
        "read": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    }
  ],
  "unreadCount": 1
}
```

---

### `POST /messages` — Gửi tin nhắn

**Auth:** ✅ Required

**Request Body:**
```json
{
  "receiverId": "2",
  "content": "Nội dung tin nhắn"
}
```

| Field | Type | Required | Validation |
|---|---|---|---|
| receiverId | string | ✅ | ID người nhận |
| content | string | ✅ | 1–1000 ký tự |

**Response (201):** Trả về tin nhắn vừa gửi.

---

### `GET /messages/:userId` — Lấy cuộc trò chuyện với 1 user

**Auth:** ✅ Required

**Response (200):**
```json
[
  {
    "id": "1",
    "senderId": "1",
    "receiverId": "2",
    "content": "Tin nhắn",
    "read": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```
Tự động đánh dấu các tin nhắn chưa đọc là đã đọc.

---

## 10. Bookmarks

### `GET /bookmarks` — Lấy danh sách bài viết đã lưu

**Auth:** ✅ Required

**Response (200):** Mảng posts (xem mục Posts).

---

### `POST /bookmarks` — Lưu bài viết

**Auth:** ✅ Required

**Request Body:**
```json
{
  "postId": "1"
}
```

**Response (201):**
```json
{
  "success": true
}
```

---

### `DELETE /bookmarks` — Bỏ lưu bài viết

**Auth:** ✅ Required

**Request Body:**
```json
{
  "postId": "1"
}
```

**Response (200):**
```json
{
  "success": true
}
```

---

## 11. Block

### `GET /blocked` — Lấy danh sách user đã chặn

**Auth:** ✅ Required

**Response (200):** Mảng user objects.

---

### `POST /users/:username/block` — Chặn user

**Auth:** ✅ Required

**Response (200):**
```json
{
  "success": true
}
```

**Errors:**
- `400` — Đã chặn / Không thể tự chặn mình
- `401` — Chưa đăng nhập

---

### `DELETE /users/:username/block` — Bỏ chặn user

**Auth:** ✅ Required

**Response (200):**
```json
{
  "success": true
}
```

---

## 12. Reports

### `POST /reports` — Gửi báo cáo

**Auth:** ✅ Required

**Request Body:**
```json
{
  "reason": "spam",
  "description": "Mô tả chi tiết vấn đề",
  "postId": "1",      // optional
  "userId": "2"       // optional
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| reason | enum | ✅ | `spam`, `harassment`, `abuse`, `inappropriate`, `misinformation`, `other` |
| description | string | ✅ | 10–1000 ký tự |
| postId | string | ❌ | Phải có ít nhất postId hoặc userId |
| userId | string | ❌ | Phải có ít nhất postId hoặc userId |

**Response (201):** Trả về report đã tạo.

**Errors:**
- `400` — Phải cung cấp postId hoặc userId

---

## 13. Search

### `GET /search?q=query&type=all`

**Query Params:**

| Param | Type | Required | Description |
|---|---|---|---|
| q | string | ✅ | Từ khóa (≥2 ký tự) |
| type | string | ❌ | `all` (mặc định), `posts`, `users` |

**Response (200):**
```json
{
  "posts": [
    {
      "id": "1",
      "userId": "1",
      "content": "Nội dung bài viết",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "users": [
    {
      "id": "2",
      "name": "Họ và tên",
      "username": "username",
      "avatar": "https://...",
      "bio": "Tiểu sử"
    }
  ]
}
```

---

## 14. Hashtags

### `GET /hashtags?trending=true` — Lấy hashtag thịnh hành

**Response (200):**
```json
[
  {
    "id": "1",
    "tag": "javascript",
    "count": 42,
    "lastUsed": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### `GET /hashtags?q=tag` — Tìm hashtag cụ thể

**Response (200):**
```json
{
  "hashtag": {
    "id": "1",
    "tag": "javascript",
    "count": 42,
    "lastUsed": "2024-01-01T00:00:00.000Z"
  },
  "posts": [
    { ... }
  ]
}
```

---

## 15. Preferences

### `GET /auth/preferences` — Lấy cài đặt user

**Auth:** ✅ Required

**Response (200):**
```json
{
  "userId": "1",
  "theme": "light",
  "emailNotifications": true,
  "notificationSettings": {
    "likes": true,
    "comments": true,
    "follows": true,
    "messages": true
  }
}
```

---

### `PUT /auth/preferences` — Cập nhật cài đặt

**Auth:** ✅ Required

**Request Body:**
```json
{
  "theme": "dark",
  "emailNotifications": false,
  "notificationSettings": {
    "likes": true,
    "comments": false,
    "follows": true,
    "messages": true
  }
}
```

**Response (200):** Trả về preferences đã cập nhật.

---

## 16. Analytics

### `GET /analytics` — Lấy thống kê cá nhân

**Auth:** ✅ Required

**Response (200):**
```json
{
  "stats": {
    "postCount": 12,
    "likeCount": 84,
    "commentCount": 35,
    "followerCount": 56
  },
  "weeklyData": [
    { "name": "Week 1", "likes": 5, "comments": 2 },
    { "name": "Week 2", "likes": 8, "comments": 4 },
    { "name": "Week 3", "likes": 10, "comments": 6 },
    { "name": "Week 4", "likes": 16, "comments": 10 }
  ]
}
```

---

## 17. HTTP Status Codes

| Code | Mô tả |
|---|---|
| 200 | Thành công |
| 201 | Đã tạo thành công |
| 400 | Bad Request — Dữ liệu không hợp lệ |
| 401 | Unauthorized — Chưa đăng nhập |
| 403 | Forbidden — Không có quyền |
| 404 | Not Found — Không tìm thấy |
| 409 | Conflict — Tài nguyên đã tồn tại |
| 500 | Internal Server Error — Lỗi server |

---

## 18. Error Response Format

```json
{
  "error": "Mô tả lỗi"
}
```

Hoặc với validation errors:
```json
{
  "error": "Dữ liệu không hợp lệ",
  "details": [
    { "message": "email must be a valid email", "path": ["email"] }
  ]
}
```

---

## Database Schema

Dự án sử dụng SQLite với 12 bảng:

```
users         — Tài khoản người dùng
posts         — Bài viết
likes         — Lượt thích
comments      — Bình luận
follows        — Quan hệ theo dõi
bookmarks     — Bài viết đã lưu
notifications — Thông báo
messages      — Tin nhắn
blocks        — User đã chặn
reports       — Báo cáo
hashtags       — Hashtag
user_preferences — Cài đặt người dùng
```

---

## Security

- Mật khẩu được hash bằng **bcryptjs** (10 salt rounds)
- JWT token lưu trong **HttpOnly cookie**
- Input validation bằng **Zod**
- Foreign key constraints trong SQLite
- SQL injection prevention qua parameterized queries