# IRIS Face Recognition

[Tiếng Việt](#tiếng-việt) | [English](#english)

## Tiếng Việt

Home Assistant OS add-on cho `ghcr.io/anhnvme/facedetect:1.0.2`.

IRIS nhận diện khuôn mặt local bằng InsightFace. Dữ liệu được lưu trên máy Home Assistant.

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


- `data_dir`: path mà add-on đưa cho IRIS làm thư mục `/data`.
- Mặc định `/homeassistant/iris` để xem được bằng File editor trong thư mục cấu hình Home Assistant.
- Nếu muốn dễ truy cập qua Samba/file editor, dùng `/share/iris`.
- Nếu muốn đặt trong media storage, dùng `/media/iris`.

### Port

App lắng nghe container port `80`.

Trong Home Assistant add-on settings, đổi **Network -> 80/tcp** sang host port mong muốn. Mặc định là `8080`.

### Cài đặt

1. Add repository này trong Home Assistant: **Settings -> Add-ons -> Add-on Store -> Repositories**.
2. Install **IRIS Face Recognition**.
3. Start add-on.
4. Bấm **Open Web UI** hoặc vào `http://homeassistant.local:8080`.

### Dữ liệu

IRIS lưu dưới `data_dir`:

```text
database/iris.sqlite3
models/insightface/
uploads/
```

### Lưu ý license

InsightFace pretrained models có thể bị giới hạn cho mục đích nghiên cứu phi thương mại. Xem license upstream trước khi dùng thương mại.

## English

Home Assistant OS add-on wrapper for `ghcr.io/anhnvme/facedetect:1.0.2`.

IRIS runs local face recognition with InsightFace. Data stays on the Home Assistant machine.

### Options

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

- `data_dir`: path passed to IRIS as its `/data` directory.
- The default `/homeassistant/iris` is visible from File editor inside the Home Assistant configuration directory.
- Use `/share/iris` if you want easier access through Samba/file editor.
- Use `/media/iris` only if you want the data under media storage.

### Port

The app listens on container port `80`.

In Home Assistant add-on settings, change **Network -> 80/tcp** to any host port you want. Default is `8080`.

### Install

1. Add this repository in Home Assistant: **Settings -> Add-ons -> Add-on Store -> Repositories**.
2. Install **IRIS Face Recognition**.
3. Start the add-on.
4. Click **Open Web UI** or visit `http://homeassistant.local:8080`.

### Data

IRIS stores data under `data_dir`:

```text
database/iris.sqlite3
models/insightface/
uploads/
```

### License Note

InsightFace pretrained models may have non-commercial research restrictions. Review the upstream project license notes before commercial use.
