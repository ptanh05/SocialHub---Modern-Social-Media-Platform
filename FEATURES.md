# SocialHub - Danh sách tính năng hoàn chỉnh

## Tổng quan

SocialHub là nền tảng mạng xã hội đầy đủ tính năng với 14 tính năng nâng cao được triển khai xuyên suốt 6 giai đoạn chính cùng 8 giai đoạn tính năng nâng cao. Giao diện người dùng hoàn toàn bằng tiếng Việt.

## Tính năng Cốt lõi (Giai đoạn 1-6)

### Giai đoạn 1: Hệ thống Xác thực
- Xác thực dựa trên JWT với HttpOnly cookies
- Hash mật khẩu bảo mật bằng bcryptjs (10 salt rounds)
- Đăng ký người dùng với validation
- Đăng nhập người dùng bằng email/password
- Bảo vệ route bằng middleware
- Lấy thông tin người dùng hiện tại

### Giai đoạn 2: Bài viết & Trang chủ
- Tạo bài viết với text và ảnh tùy chọn
- Xem trang chủ với tất cả bài viết
- Xóa bài viết của mình
- Hiển thị thời gian tương đối (VD: "2 giờ trước")
- Phân trang bài viết
- Thông tin tác giả bài viết
- Cập nhật thời gian thực với SWR

### Giai đoạn 3: Tương tác
- Thích/bỏ thích bài viết
- Thêm bình luận vào bài viết
- Xem bình luận trên bài viết
- Xóa bình luận (bởi tác giả hoặc chủ bài viết)
- Hiển thị số lượt thích
- Hiển thị số bình luận
- Cập nhật UI optimistic

### Giai đoạn 4: Tính năng Xã hội
- Theo dõi/bỏ theo dõi người dùng
- Trang hồ sơ người dùng với thống kê
- Tìm kiếm người dùng toàn cầu
- Số lượng người theo dõi / đang theo dõi
- Trang khám phá với gợi ý người dùng
- Hiển thị bio người dùng
- Liên kết hồ sơ người dùng

### Giai đoạn 5: Cá nhân hóa
- Chỉnh sửa hồ sơ (tên và bio)
- Trang cài đặt
- Quản lý tài khoản
- Chức năng đăng xuất
- Quản lý hồ sơ

### Giai đoạn 6: Hoàn thiện
- Thiết kế hiện đại với color tokens tùy chỉnh
- Thiết kế responsive (mobile-first)
- Màu giao diện sáng/tối
- Chỉ báo loading
- Xử lý lỗi
- Trang 404
- Điều hướng sạch sẽ

## Tính năng Nâng cao (Giai đoạn 7-14)

### Giai đoạn 7: Thông báo Thời gian thực
- Hệ thống thông báo trong ứng dụng
- Chuông thông báo với badge số chưa đọc
- Loại thông báo: thích, bình luận, theo dõi, tin nhắn
- Đánh dấu thông báo đã đọc (từng cái)
- Đánh dấu tất cả thông báo đã đọc
- Lịch sử thông báo
- Menu dropdown thông báo
- Cập nhật thời gian thực dựa trên polling (5 giây)
- Lưu trữ thông báo bền vững

### Giai đoạn 8: Nhắn tin Trực tiếp
- Tin nhắn riêng tư một-một
- Danh sách cuộc trò chuyện với xem trước tin nhắn cuối
- Xem từng cuộc trò chuyện
- Gửi tin nhắn
- Trạng thái đã đọc tin nhắn
- Lịch sử tin nhắn
- Cập nhật tin nhắn thời gian thực (polling 2-3 giây)
- Sắp xếp cuộc trò chuyện
- Nhiều cuộc trò chuyện đồng thời
- Số tin nhắn chưa đọc

### Giai đoạn 9: Quản lý Bài viết & Bình luận
- Chỉnh sửa bài viết sau khi tạo
- Giữ nguyên thời gian tạo bài viết
- Xóa bình luận bởi tác giả bình luận
- Xóa bình luận bởi chủ bài viết
- Kiểm tra ủy quyền bình luận
- Cập nhật nội dung bài viết
- Modal chỉnh sửa bài viết
- Đếm ký tự cho bài viết

### Giai đoạn 10: Tìm kiếm & Hashtags Nâng cao
- Tìm kiếm toàn văn bản bài viết
- Tìm kiếm người dùng theo tên/username/bio
- Phát hiện hashtag trong bài viết
- Tính toán hashtag thịnh hành
- Trang hashtag với bài viết liên quan
- Lọc tìm kiếm (all/posts/users)
- Hiển thị kết quả tìm kiếm
- Gợi ý autocomplete
- Đếm bài viết theo hashtag

### Giai đoạn 11: Giao diện & Tùy chỉnh Người dùng
- Chuyển giao diện sáng/tối/hệ thống
- Lưu giao diện vào database
- Lưu trữ tùy chỉnh người dùng
- Cài đặt thông báo (thích, bình luận, theo dõi, tin nhắn)
- Nút thông báo email
- Trang cài đặt với tất cả tùy chọn
- Chuyển giao diện thời gian thực
- Tích hợp API tùy chỉnh

### Giai đoạn 12: Phân trang & Cuộn Vô hạn
- Component cuộn vô hạn
- API Intersection Observer
- Hook phân trang
- Tải thêm khi cuộn
- Chỉ báo loading
- Phân trang dựa trên page
- Cấu hình auto-load
- Element sentinel kích hoạt tải

### Giai đoạn 13: Đánh dấu, Chặn & Báo cáo
- Lưu/đánh dấu bài viết để xem sau
- Trang bài viết đã lưu
- Chặn người dùng
- Xem danh sách người dùng bị chặn
- Bỏ chặn người dùng
- Báo cáo bài viết kèm lý do
- Báo cáo người dùng kèm lý do
- Mô tả báo cáo
- Theo dõi trạng thái báo cáo (pending/reviewed/dismissed/action_taken)
- Lý do báo cáo (spam, harassment, abuse, inappropriate, misinformation, other)

### Giai đoạn 14: Nguồn cấp Hoạt động & Phân tích
- Nguồn cấp hoạt động người dùng theo ngày
- Hoạt động nhóm theo phần (hôm nay, tuần này, cũ hơn)
- Dashboard số liệu tương tác
- Bộ đếm tổng lượt thích
- Bộ đếm tổng bình luận
- Hiển thị số người theo dõi
- Biểu đồ tương tác (Recharts)
- Dữ liệu tương tác theo tuần
- Hiệu suất bài viết hàng đầu
- Card tóm tắt bài viết

## Triển khai Kỹ thuật

### Hàm Database (lib/db.ts)
- 50+ hàm database bao phủ tất cả tính năng qua SQLite (`better-sqlite3`)
- Quản lý người dùng (tạo, lấy, tìm kiếm)
- Quản lý bài viết (tạo, đọc, cập nhật, xóa)
- Quản lý tương tác (thích, bình luận)
- Logic theo dõi/bỏ theo dõi
- Quản lý thông báo
- Quản lý tin nhắn
- Logic chặn
- Quản lý báo cáo
- Quản lý hashtag
- Tùy chỉnh người dùng

### API Routes
- 20+ endpoint API
- Các operation POST/GET/PUT/DELETE
- HTTP status codes đúng
- Validation input bằng Zod trên tất cả input
- Kiểm tra xác thực
- Kiểm tra ủy quyền
- Xử lý lỗi
- JSON responses

### React Hooks
- 8 custom hooks để quản lý dữ liệu
- SWR cho caching phía client
- Polling cho dữ liệu thời gian thực
- Hàm mutation
- Trạng thái loading/error
- Cache invalidation

### UI Components
- 15+ component tùy chỉnh
- Post cards có thể tái sử dụng
- Modal dialog để chỉnh sửa
- Notification bell dropdown
- Search bar với submission
- Conversation views
- Biểu đồ phân tích
- Activity feed displays
- Report dialogs

### Pages (18 total)
- 6 trang xác thực
- 12 trang ứng dụng
- Protected route patterns
- Dynamic routing với parameters
- Server và client components

## Hệ thống Thiết kế

### Color Scheme
- Primary: Tím (oklch(0.42 0.15 300))
- Background: Sáng (oklch(0.98 0.01 240))
- Dark Mode: Hỗ trợ đầy đủ với oklch values
- Neutrals: Xám cho phần tử phụ
- 5-color palette tối đa

### Typography
- Sans serif cho headers và body
- Monospace cho code
- Font sizes: 10px - 32px range
- Line heights: 1.4-1.6

### Components Library
- shadcn/ui với Radix UI primitives
- Pre-built components:
  - Button, Input, Textarea
  - Card, Dialog, Dropdown
  - Avatar, Badge
  - Tabs, Select
  - Form components
  - Charts and graphs

## Database Schema

### Tables (12 bảng trong SQLite)
1. `users` — Dữ liệu hồ sơ người dùng
2. `posts` — Nội dung bài viết
3. `likes` — Lượt thích bài viết
4. `comments` — Bình luận bài viết
5. `follows` — Quan hệ theo dõi
6. `bookmarks` — Bài viết đã lưu
7. `notifications` — Thông báo người dùng
8. `messages` — Tin nhắn trực tiếp
9. `blocks` — User đã chặn
10. `reports` — Báo cáo nội dung
11. `hashtags` — Hashtag tracking
12. `user_preferences` — Cài đặt người dùng

## Tính năng Bảo mật

- Hash mật khẩu bằng bcryptjs
- Xác thực JWT token
- Lưu trữ HttpOnly cookie
- Kiểm tra ủy quyền trên các action được bảo vệ
- Validation input với Zod
- Phòng chống SQL injection (parameterized queries)
- CSRF protection

## Tối ưu Hiệu suất

- SWR caching strategy
- Optimistic UI updates
- Polling thay vì WebSockets (implement đơn giản)
- Lazy loading ảnh
- Code splitting component
- Efficient re-renders với React optimization
- Selector pagination

## Ghi chú Mở rộng

Database SQLite có thể dễ dàng thay thế bằng:
- **Supabase**: PostgreSQL + Auth + Real-time
- **Neon**: Serverless PostgreSQL
- **PlanetScale**: MySQL serverless
- **AWS**: RDS + Cognito + DynamoDB

Để mở rộng:
1. Thay hàm database bằng truy vấn thực
2. Thêm hệ thống migration
3. Triển khai pagination đúng với cursors
4. Thêm caching layer (Redis)
5. Triển khai WebSocket cho thời gian thực
6. Thêm message queue cho notifications
7. Triển khai CDN cho media storage

## Ghi chú Phát triển

### Tổ chức File
- API routes được tổ chức theo tính năng
- Components được nhóm theo chức năng
- Hooks cho data management
- Schemas cho validation
- Database functions trong lib/db.ts
- Utilities trong lib/

### Code Patterns
- Component composition
- Custom hooks cho logic
- SWR cho data fetching
- Zod cho validation
- Next.js API routes
- Protected middleware
- Error boundaries

### Best Practices
- Không dùng localStorage (tất cả dữ liệu phía server)
- Xử lý lỗi đúng cách
- Trạng thái loading
- Optimistic updates
- Kiểm tra ủy quyền
- Validation input
- TypeScript types
- Component reusability

## Roadmap Tương lai

### Ưu tiên cao
- Cập nhật WebSocket thời gian thực
- Thông báo email
- Lưu trữ media (Vercel Blob)
- Tối ưu hóa ảnh

### Ưu tiên trung bình
- @mention người dùng với autocomplete
- Chia sẻ bài viết / retweet
- Thuật toán feed nâng cao
- Huy hiệu và xác minh người dùng

### Nice to Have
- Hỗ trợ video
- Live streaming
- Tích hợp thanh toán
- Tính năng premium
- Thuật toán đề xuất
- Export phân tích
