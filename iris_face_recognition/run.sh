#!/bin/sh
set -eu

OPTIONS_FILE="/data/options.json"

# Đọc 1 tùy chọn từ options.json (có giá trị mặc định)
get_option() {
  node -e '
    const fs = require("fs");
    const [file, key, fallback] = process.argv.slice(1);
    try {
      const options = JSON.parse(fs.readFileSync(file, "utf8"));
      const value = options[key];
      process.stdout.write(value === undefined || value === null || value === "" ? fallback : String(value));
    } catch {
      process.stdout.write(fallback);
    }
  ' "$OPTIONS_FILE" "$1" "$2"
}

data_dir="$(get_option data_dir /data)"

case "$data_dir" in
  /data|/data/*|/homeassistant/*|/share/*|/media/*) ;;
  *)
    echo "data_dir không hợp lệ: $data_dir"
    echo "Hãy dùng /data, /homeassistant/iris, /share/iris hoặc /media/iris."
    exit 1
    ;;
esac

mkdir -p "$data_dir"
export IRIS_DATA_DIR="$data_dir"

# Cấu hình tự động xóa ảnh khi đầy (áp dụng mỗi lần add-on khởi động)
export IRIS_MAX_STORAGE_MB="$(get_option max_storage_mb 2048)"
export IRIS_STORAGE_TARGET_PERCENT="$(get_option storage_target_percent 90)"
export IRIS_AUTO_CLEANUP="$(get_option auto_cleanup true)"

echo "Thư mục dữ liệu: $IRIS_DATA_DIR"
echo "Giới hạn ảnh: ${IRIS_MAX_STORAGE_MB} MB, dọn xuống còn ${IRIS_STORAGE_TARGET_PERCENT}%, tự động xóa: ${IRIS_AUTO_CLEANUP}"

exec /app/docker/start.sh
