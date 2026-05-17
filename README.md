# 🌌 SkyTodo - Peaceful Productivity & Enterprise Suite

Chào mừng bạn đến với **SkyTodo** - Hệ sinh thái quản lý công việc và tài liệu cộng tác doanh nghiệp thế hệ mới, sở hữu phong cách thiết kế kính mờ (Glassmorphism) thời thượng, tích hợp gamification tăng cấp hứng khởi và tương thích thích ứng thông minh trên mọi kích thước màn hình!

🚀 **Đường dẫn truy cập cục bộ (Local Access Link):** 
[http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

## ✨ Các tính năng đột phá vừa được nâng cấp:

### 1. 👥 Quản lý Nhân sự & Đánh giá Hiệu suất nâng cao
* Giao diện quản lý đội ngũ tại `/dashboard/users` được thiết kế mới hoàn toàn.
* **Thanh tiến độ công việc (Task Progress Bar):** Hiển thị trực quan tiến trình hoàn thành chỉ tiêu nhiệm vụ của từng người qua dải màu chuyển sắc sinh động.
* **Chấm sao năng lực (Star Ratings):** Hệ thống chấm điểm 5 sao lấp lánh kèm theo nhãn đánh giá hiệu suất tự động (*Xuất sắc • Vượt tiến độ*, *Tốt • Đúng tiến độ*, *Cần cố gắng*...).
* Biểu mẫu thêm mới nhân sự dạng kính mờ (Modal Popup) và nút xóa nhanh đồng bộ tức thời với cơ sở lưu trữ LocalStorage.

### 📊 2. Biểu đồ tròn Phân bổ công việc tổng thể (Donut Chart)
* Chuyển đổi biểu đồ cột cũ thành **Biểu đồ tròn khuyết giữa (Donut Pie Chart)** hiện đại ở trang chủ Dashboard.
* **Bộ đếm trung tâm thông minh (Centered Total Counter):** Tự động thống kê tổng chỉ tiêu nhiệm vụ toàn đội ngũ ở giữa lỗ tròn biểu đồ.
* **Hộp thoại kính mờ (Glassmorphic Tooltip):** Hiện chi tiết chỉ số Hoàn thành, Đang làm, Quá hạn khi di chuột qua từng phần biểu đồ của thành viên.

### 💬 3. Bong bóng Chat Messenger nổi trượt mượt mà
* Loại bỏ thanh chat tĩnh bên phải giúp giải phóng không gian hiển thị, hỗ trợ co giãn responsive 100% cửa sổ trình duyệt mượt mà.
* Tích hợp **Bong bóng tròn nổi Messenger** ở góc phải, khi click sẽ trượt mở cửa sổ chat kính mờ có hiệu ứng lò xo (`framer-motion`) và nút đóng `X` cực kỳ cao cấp.

### 📅 4. Tự soạn thảo tài liệu Notion cho Lịch biểu (Calendar)
* Click trực tiếp vào một sự kiện/nhiệm vụ bất kỳ trên Lịch biểu (ở tất cả các chế độ xem Tháng/Tuần/Năm) để mở hộp thoại chi tiết nhiệm vụ.
* Hộp thoại tích hợp **Trình soạn thảo văn bản kiểu Notion** giúp biên tập ghi chú, check-list, tiêu đề và đồng bộ hóa trực tiếp 2 chiều về hệ thống.

### 📐 5. Tự động thích ứng co giãn Responsive (Fluid Scaling)
* Loại bỏ hoàn toàn các khung giới hạn chiều rộng cứng nhắc, cho phép toàn bộ bảng Kanban, biểu đồ và các panel co giãn, thu nhỏ hoặc phóng to lấp đầy 100% không gian trình duyệt theo thời gian thực.

---

## 🛠️ Hướng dẫn Khởi chạy Dự án (Local Setup)

Để khởi chạy dự án dưới máy tính của bạn:

1. **Cài đặt các thư viện phụ thuộc:**
   ```bash
   npm install
   ```

2. **Khởi chạy môi trường Phát triển:**
   ```bash
   npm run dev
   ```

3. **Truy cập trang quản trị:**
   Mở trình duyệt (như Cốc Cốc, Chrome) và truy cập đường dẫn:
   👉 **[http://localhost:3000/dashboard](http://localhost:3000/dashboard)**

---

## 🌐 Hướng dẫn đẩy lên Vercel chạy Online (Deploy to Vercel)

Để trang web có đường dẫn chạy trực tuyến online trên Internet chia sẻ cho mọi người:

1. Truy cập trang web **[Vercel](https://vercel.com/)** và đăng nhập bằng tài khoản GitHub của bạn.
2. Click nút **"Add New"** -> chọn **"Project"**.
3. Chọn kho lưu trữ **`xuanmai171202-spec/to`** của bạn và ấn **Import**.
4. Trong mục thiết lập biến môi trường (Environment Variables), hãy thêm các biến kết nối database Supabase của bạn (nếu có) hoặc để mặc định để chạy chế độ Offline Demo cực đỉnh.
5. Ấn **Deploy**. Sau 1 phút, bạn sẽ có ngay một đường dẫn link web online chính thức (ví dụ: `https://to-xyz.vercel.app`) chạy trực tuyến trên Cốc Cốc!
