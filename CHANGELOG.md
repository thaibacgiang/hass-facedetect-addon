# Changelog

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

