# IRIS Face Recognition Add-on

[Tiếng Việt](#tiếng-việt) | [English](#english)

## Tiếng Việt

Repository này đóng gói [`anhnvme/facedetect`](https://github.com/anhnvme/facedetect) thành Home Assistant OS add-on.

IRIS chạy nhận diện khuôn mặt local bằng InsightFace. Database, ảnh upload, model và log nằm trên máy Home Assistant, không cần cloud account.

### Thông tin nhanh

- Add-on folder: `iris_face_recognition/`
- Image gốc: `ghcr.io/anhnvme/facedetect:1.0.2` (giao diện được build lại từ thư mục `iris_face_recognition/app/` với bản dịch tiếng Việt)
- Container port: `80`
- Host port mặc định: `8080`
- Data mặc định trong container: `/data`

### Cài đặt

1. Đẩy repository này lên GitHub.
2. Vào Home Assistant: **Settings -> Add-ons -> Add-on Store -> Repositories**.
3. Thêm URL repository này.
4. Cài add-on **IRIS Face Recognition**.
5. Start add-on.
6. Bấm **Open Web UI** hoặc vào `http://homeassistant.local:8080`.

### Cấu hình

```yaml
data_dir: /homeassistant/iris
max_storage_mb: 2048
storage_target_percent: 90
auto_cleanup: true
```

- `max_storage_mb`: dung lượng ảnh tối đa (MB). Vượt mức này, hệ thống tự xóa ảnh cũ nhất.
- `storage_target_percent`: xóa xuống còn bao nhiêu % của mức tối đa (mặc định 90%) để không phải dọn liên tục.
- `auto_cleanup`: bật/tắt tự động xóa. Hệ thống kiểm tra mỗi 10 phút và sau mỗi lần nhận diện.
- Có thể chỉnh trực tiếp trong giao diện web: **Cài đặt → Lưu trữ**. Giá trị trong tùy chọn add-on sẽ được áp dụng lại mỗi lần add-on khởi động.
- Ảnh người lạ và khuôn mặt đã huấn luyện được bảo vệ, không bị xóa tự động.


`data_dir` là path mà add-on đưa cho IRIS làm thư mục `/data` để lưu dữ liệu.

Mặc định `/homeassistant/iris` để có thể xem bằng File editor trong thư mục cấu hình Home Assistant.

Nếu muốn dữ liệu nằm ở khu vực dễ truy cập hơn, đổi thành:

```yaml
data_dir: /share/iris
```

hoặc:

```yaml
data_dir: /media/iris
```

IRIS sẽ lưu bên trong path đó:

```text
database/iris.sqlite3
models/insightface/
uploads/
```

### Đổi port

App lắng nghe container port `80`.

Trong trang add-on của Home Assistant, vào **Network** và đổi mapping của `80/tcp` sang port host mong muốn. Mặc định là `8080`.

### Ghi chú

InsightFace pretrained models có thể bị giới hạn cho mục đích nghiên cứu phi thương mại. Xem license upstream trước khi dùng thương mại.

## English

This repository packages [`anhnvme/facedetect`](https://github.com/anhnvme/facedetect) as a Home Assistant OS add-on.

IRIS runs local face recognition with InsightFace. The database, uploaded images, models, and logs stay on the Home Assistant machine. No cloud account is required.

### Quick Info

- Add-on folder: `iris_face_recognition/`
- Runtime image: `ghcr.io/anhnvme/facedetect:1.0.2`
- Container port: `80`
- Default host port: `8080`
- Default container data directory: `/data`

### Install

1. Push this repository to GitHub.
2. In Home Assistant, go to **Settings -> Add-ons -> Add-on Store -> Repositories**.
3. Add this repository URL.
4. Install **IRIS Face Recognition**.
5. Start the add-on.
6. Click **Open Web UI** or visit `http://homeassistant.local:8080`.

### Configuration

```yaml
data_dir: /homeassistant/iris
max_storage_mb: 2048
storage_target_percent: 90
auto_cleanup: true
```

- `max_storage_mb`: maximum image storage in MB. When exceeded, the oldest images are deleted automatically.
- `storage_target_percent`: clean down to this percentage of the limit (default 90%).
- `auto_cleanup`: enable or disable automatic cleanup (checked every 10 minutes and after each recognition).
- Also editable in the web UI under **Settings -> Storage**. Add-on options are re-applied on every add-on start.
- Unknown-visitor originals and trained faces are protected and never auto-deleted.

`data_dir` is the path passed to IRIS as its `/data` storage directory.

The default `/homeassistant/iris` is visible from File editor inside the Home Assistant configuration directory.

If you want the data in an easier-to-access location, use:

```yaml
data_dir: /share/iris
```

or:

```yaml
data_dir: /media/iris
```

IRIS stores these files under that path:

```text
database/iris.sqlite3
models/insightface/
uploads/
```

### Change Port

The app listens on container port `80`.

In the Home Assistant add-on page, open **Network** and change the `80/tcp` host mapping to any port you want. The default is `8080`.

### Notes

InsightFace pretrained models may be limited to non-commercial research use. Review the upstream licensing notes before commercial use.
