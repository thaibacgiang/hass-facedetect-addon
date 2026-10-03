# Changelog

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

