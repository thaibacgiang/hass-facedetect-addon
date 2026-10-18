# Changelog

## 1.2.1 - 2026-10-18

- Kích hoạt bị bỏ qua vì camera đang bận xử lý lần trước (ví dụ tự động hóa bấm lặp lại sau vài giây) không còn tạo sự kiện "Skipped" nữa; chỉ ghi nhật ký, tối đa 1 dòng mỗi 30 giây cho mỗi camera.

## 1.2.0 - 2026-10-18

- **Chụp liên tiếp nhiều khung hình** mỗi lần kích hoạt (mặc định 5 khung, cách nhau 1 giây) thay vì chỉ 1 ảnh đúng lúc bấm nút. Dừng sớm khi nhận ra người quen, nếu không thì chọn khung tốt nhất (có mặt, giống nhất, mặt to nhất). Chỉ lưu 1 ảnh được chọn.
- **Tự động quét camera** không cần bấm nút: đặt chu kỳ (giây) trong trang chi tiết camera; chỉ tạo sự kiện khi thấy khuôn mặt, không lưu ảnh khi không có người. Mặc định tắt.
- Sửa lỗi thời gian chờ (cooldown): trước đây bắt đầu tính ngay lúc bấm nút nên một lần bấm khi chưa có người sẽ khóa camera cả phút. Giờ chỉ tính từ lần thật sự phát hiện khuôn mặt.
- Chặn chạy trùng: bấm nút liên tục khi camera đang xử lý sẽ không tạo nhiều luồng nhận diện song song.
- Thêm 3 tùy chọn mỗi camera: `burst_count`, `burst_interval_ms`, `auto_interval` (tự nâng cấp cơ sở dữ liệu cũ, camera cũ dùng giá trị mặc định).

## 1.1.2 - 2026-10-18

- Sửa giới hạn lưu nhật ký: khi đủ số dòng đã đặt, hệ thống xóa đúng các dòng cũ nhất và luôn giữ các dòng mới nhất (trước đây nhiều log trong cùng 1 giây bị xóa/giữ lẫn lộn do sắp xếp theo thời gian chỉ chính xác đến giây).
- Trang nhật ký sắp xếp ổn định, phân trang không còn bị xáo trộn.
- Lỗi khi dọn nhật ký không còn làm hỏng việc ghi sự kiện nhận diện.

## 1.1.0 - 2026-10-03

- Việt hóa toàn bộ giao diện web, thông báo và nhật ký hệ thống; thời gian hiển thị theo định dạng Việt Nam.
- Tự động xóa ảnh cũ khi vượt dung lượng tối đa: chạy nền mỗi 10 phút và sau mỗi lần nhận diện.
- Thêm cài đặt "Dọn xuống còn (%)" để xóa dư ra, tránh phải dọn lại liên tục.
- Thêm công tắc bật/tắt tự động xóa ảnh trong **Cài đặt → Lưu trữ**.
- Thêm tùy chọn add-on `max_storage_mb`, `storage_target_percent`, `auto_cleanup` (kèm bản dịch tiếng Việt).
- Add-on build lại giao diện từ mã nguồn đi kèm trong `iris_face_recognition/app/`.

## 1.0.2 - 2026-07-06

- Store IRIS data under `/homeassistant/iris` by default so it is visible in Home Assistant File editor.
- Mount the Home Assistant configuration directory into the add-on at `/homeassistant`.
- Allow `data_dir` to use `/homeassistant/iris`, `/share/iris`, `/media/iris`, or `/data`.
- Update repository metadata to `anhnvme/hass-facedetect-addon`.

