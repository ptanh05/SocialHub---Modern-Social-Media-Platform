# SocialHub - Nền tảng Mạng Xã Hội Hiện Đại

Một ứng dụng mạng xã hội đầy đủ tính năng được xây dựng với Next.js, hỗ trợ xác thực người dùng, bài viết, tương tác (like/bình luận), và các tính năng xã hội (theo dõi, tìm kiếm, hồ sơ). Giao diện hoàn toàn bằng tiếng Việt.

## Tính năng

### Giai đoạn 1: Xác thực ✓
- Hệ thống xác thực dựa trên JWT
- Hash mật khẩu bảo mật bằng bcryptjs
- Lưu trữ HttpOnly cookie
- Đăng ký và đăng nhập người dùng
- Bảo vệ route bằng middleware

### Giai đoạn 2: Trang chủ & Bài viết ✓
- Tạo, đọc và xóa bài viết
- Trang chủ có phân trang
- Cập nhật bài viết thời gian thực với SWR
- Hỗ trợ tải ảnh lên
- Định dạng thời gian tương đối

### Giai đoạn 3: Tương tác ✓
- Thích/bỏ thích bài viết với cập nhật optimistic
- Hệ thống bình luận
- Số lượng tương tác thời gian thực
- Hiển thị và tạo bình luận

### Giai đoạn 4: Tính năng Xã hội ✓
- Theo dõi/bỏ theo dõi người dùng
- Hồ sơ người dùng với thống kê (người theo dõi, đang theo dõi, bài viết)
- Tìm kiếm người dùng toàn cầu
- Trang khám phá để tìm người dùng
- Bio và thông tin hồ sơ

### Giai đoạn 5: Cá nhân hóa ✓
- Chỉnh sửa tên và bio hồ sơ
- Trang cài đặt quản lý tài khoản
- Chức năng đăng xuất bảo mật
- Quản lý hồ sơ

### Giai đoạn 6: Hoàn thiện & Triển khai ✓
- UI hiện đại với design tokens
- Loading skeletons
- Xử lý lỗi
- Trang 404
- Thiết kế responsive
- Điều hướng sạch sẽ

### Giai đoạn 7: Thông báo nâng cao ✓
- Hệ thống thông báo thời gian thực với polling
- Chuông thông báo với badge chưa đọc
- Đánh dấu thông báo đã đọc (từng cái và tất cả)
- Loại thông báo: thích, bình luận, theo dõi, tin nhắn
- Lịch sử thông báo và xóa

### Giai đoạn 8: Nhắn tin trực tiếp ✓
- Nhắn tin riêng tư một-một
- Danh sách cuộc trò chuyện với xem trước tin nhắn cuối
- Cập nhật tin nhắn thời gian thực (polling 2-3 giây)
- Theo dõi trạng thái đã đọc
- Luồng trò chuyện riêng
- Nhiều cuộc trò chuyện đồng thời

### Giai đoạn 9: Quản lý Bài viết & Bình luận ✓
- Chỉnh sửa bài viết sau khi tạo
- Xóa bình luận (bởi tác giả hoặc chủ bài viết)
- Xóa bình luận với ủy quyền đúng
- Xóa cascade dữ liệu liên quan

### Giai đoạn 10: Tìm kiếm & Hashtag nâng cao ✓
- Tìm kiếm toàn văn bản bài viết và người dùng
- Hỗ trợ hashtag và hashtag thịnh hành
- Trang hashtag với bài viết liên quan
- Lọc tìm kiếm theo loại (bài viết/người dùng/tất cả)
- Phần hashtag thịnh hành

### Giai đoạn 11: Giao diện & Tùy chỉnh ✓
- Chuyển giao diện sáng/tối/hệ thống
- Lưu giao diện vào tùy chỉnh người dùng
- Cài đặt thông báo (thích, bình luận, theo dõi, tin nhắn)
- Nút thông báo email
- Trang cài đặt với tất cả tùy chọn

### Giai đoạn 12: Phân trang & Cuộn vô hạn ✓
- Component cuộn vô hạn với Intersection Observer
- Hook phân trang quản lý tải trang
- Tự động tải thêm khi cuộn
- Chỉ báo loading

### Giai đoạn 13: Đánh dấu, Chặn & Báo cáo ✓
- Lưu/đánh dấu bài viết để xem sau
- Chặn người dùng để ngăn tương tác
- Xem danh sách người dùng bị chặn
- Bỏ chặn người dùng
- Báo cáo bài viết và người dùng kèm lý do
- Theo dõi lịch sử báo cáo

### Giai đoạn 14: Hoạt động & Phân tích ✓
- Nguồn cấp hoạt động người dùng theo ngày
- Dashboard phân tích với số liệu tương tác
- Biểu đồ hiển thị tương tác theo thời gian
- Tóm tắt hiệu suất bài viết
- Theo dõi tăng trưởng người theo dõi
- Phân tích theo tuần

## Tech Stack

- **Framework**: Next.js 16
- **Auth**: JWT với HttpOnly cookies
- **Hash mật khẩu**: bcryptjs
- **Data Fetching**: SWR (Client-side caching với polling)
- **UI Components**: shadcn/ui với Radix UI
- **Styling**: Tailwind CSS với custom design tokens
- **Validation**: Zod
- **Icons**: Lucide React
- **Charts**: Recharts cho phân tích
- **Database**: SQLite qua `better-sqlite3` (local, persistent)
- **Real-time**: Polling cho thông báo và tin nhắn (sẵn sàng WebSocket)

## Cấu trúc dự án

```
app/
├── (auth)/                 # Route xác thực (đăng nhập, đăng ký)
├── (app)/                  # Route được bảo vệ
│   ├── feed/              # Trang chủ chính
│   ├── profile/[username]/ # Hồ sơ người dùng
│   ├── explore/           # Khám phá người dùng / tìm kiếm
│   ├── settings/          # Cài đặt tài khoản & giao diện
│   ├── messages/          # Nhắn tin trực tiếp
│   ├── messages/[userId]/ # Trò chuyện với người dùng cụ thể
│   ├── search/            # Kết quả tìm kiếm
│   ├── hashtag/[tag]/     # Trang hashtag
│   ├── bookmarks/         # Bài viết đã lưu
│   ├── blocked/           # Danh sách người bị chặn
│   ├── activity/          # Nguồn cấp hoạt động người dùng
│   ├── analytics/         # Dashboard phân tích
│   └── layout.tsx         # Layout được bảo vệ với auth guard
├── api/                    # API routes
│   ├── auth/              # Endpoint xác thực
│   ├── posts/             # Quản lý bài viết
│   ├── users/             # Endpoint người dùng
│   ├── notifications/     # Endpoint thông báo
│   ├── messages/          # Endpoint nhắn tin
│   ├── comments/          # Quản lý bình luận
│   ├── search/            # Endpoint tìm kiếm
│   ├── hashtags/          # Endpoint hashtag
│   ├── bookmarks/         # Endpoint đánh dấu
│   ├── blocked/           # Endpoint chặn
│   ├── reports/           # Endpoint báo cáo
│   ├── analytics/         # Endpoint phân tích
│   └── preferences/       # Endpoint tùy chỉnh
└── page.tsx               # Root redirect

components/
├── navbar.tsx             # Điều hướng chính với tìm kiếm
├── notification-bell.tsx   # Menu dropdown thông báo
├── search-bar.tsx         # Component thanh tìm kiếm
├── post-card.tsx          # Hiển thị bài viết với tương tác
├── create-post.tsx        # Form tạo bài viết
├── post-edit-modal.tsx     # Dialog chỉnh sửa bài viết
├── report-dialog.tsx       # Dialog form báo cáo
├── infinite-scroll.tsx     # Wrapper cuộn vô hạn
├── skeleton.tsx           # Loading skeleton
└── ui/                    # shadcn/ui components

hooks/
├── use-auth.tsx           # Context xác thực
├── use-posts.tsx          # Quản lý bài viết
├── use-interactions.tsx    # Likes và bình luận
├── use-notifications.tsx   # Quản lý thông báo
├── use-messages.tsx       # Nhắn tin trực tiếp
├── use-search.tsx         # Tìm kiếm và hashtags
├── use-preferences.tsx     # Tùy chỉnh người dùng
└── use-pagination.tsx     # Logic phân trang

lib/
├── auth.ts                # Tiện ích JWT
├── db.ts                  # Layer database SQLite
└── schemas.ts             # Validation schemas Zod
```

## Bắt đầu

### Cài đặt

1. Clone repository
2. Cài đặt dependencies:
```bash
pnpm install
```

3. Chạy server phát triển:
```bash
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

## Tài liệu API

Xem [API.md](./API.md) để biết tài liệu đầy đủ các endpoint RESTful của dự án.

## Design Tokens

Ứng dụng sử dụng hệ thống màu tùy chỉnh:
- **Primary**: Tím (oklch(0.42 0.15 300))
- **Background**: Xám nhạt xanh (oklch(0.98 0.01 240))
- **Neutrals**: Xám cho phần tử phụ
- **Dark Mode**: Hỗ trợ chế độ tối hoàn chỉnh

## Các tính năng sắp tới

### Database
- Có thể dễ dàng thay thế SQLite bằng:
  - Supabase (PostgreSQL với auth tích hợp)
  - Neon (Serverless PostgreSQL)
  - PlanetScale (MySQL)

### Tính năng nâng cao
- Cập nhật WebSocket thời gian thực (thay vì polling)
- Thông báo email với templates
- Chia sẻ bài viết / retweet
- Lưu trữ media với Vercel Blob
- Tối ưu hóa ảnh với Next.js Image
- @mention người dùng với autocomplete
- Thuật toán đề xuất nâng cao
- Hỗ trợ video cho bài viết
- Phát trực tiếp
- Huy hiệu và xác minh người dùng
- Tích hợp thanh toán cho tính năng premium

### Hiệu suất
- Tối ưu hóa ảnh với Next.js Image
- Incremental Static Regeneration (ISR)
- Chiến lược caching
- Tối ưu hóa truy vấn database

## Triển khai

Triển khai lên Vercel chỉ với một click:

1. Push code lên GitHub
2. Kết nối repository với Vercel
3. Deploy

## Bảo mật

- Mật khẩu được hash với bcrypt (10 salt rounds)
- JWT tokens được lưu trong HttpOnly cookies
- Bảo vệ CSRF
- Validation input với Zod
- Phòng chống SQL injection (parameterized queries)
- Rate limiting (khuyến nghị cho production)

## License

MIT
