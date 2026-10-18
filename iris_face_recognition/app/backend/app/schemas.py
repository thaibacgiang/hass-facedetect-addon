from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class InsightFaceSettingsIn(BaseModel):
    model_name: str = Field(default="buffalo_s", min_length=1)
    provider: Literal[
        "CPUExecutionProvider",
        "CUDAExecutionProvider",
        "OpenVINOAUTO",
        "OpenVINOCPU",
        "OpenVINOGPU",
        "OpenVINONPU",
    ] = "CPUExecutionProvider"
    det_size: int = Field(default=640, ge=320, le=1280)
    age_gender_enabled: bool = False


class PersonIn(BaseModel):
    name: str = Field(min_length=1)
    alias: str = ""
    role: Literal["Family", "Friend", "Employee", "Guest"] = "Guest"
    notes: str = ""
    status: Literal["Active", "Disabled"] = "Active"


class CameraIn(BaseModel):
    name: str = Field(min_length=1)
    model: str = ""
    status: Literal["online", "offline"] = "online"
    stream_url: str = ""
    still_url: str = ""
    face_detection: bool = True
    motion: bool = True
    cooldown: int = 60
    min_face: int = 8
    min_confidence: int = 80
    # Số khung hình tối đa chụp liên tiếp mỗi lần kích hoạt (dừng sớm khi nhận ra người quen)
    burst_count: int = Field(default=5, ge=1, le=15)
    # Khoảng cách giữa các khung hình (mili-giây)
    burst_interval_ms: int = Field(default=1000, ge=200, le=5000)
    # Tự động quét camera mỗi N giây để tìm khuôn mặt, không cần bấm nút. 0 = tắt
    auto_interval: int = Field(default=0, ge=0, le=300)


class ThresholdsIn(BaseModel):
    match: int = Field(ge=0, le=100)
    auto_accept: int = Field(ge=0, le=100)


class LogsSettingsIn(BaseModel):
    max_rows: int = Field(ge=50, le=10000)


class StorageSettingsIn(BaseModel):
    max_storage_mb: int = Field(ge=256, le=102400)
    # Khi vượt dung lượng tối đa, xóa ảnh cũ cho tới khi còn lại ngần này % dung lượng tối đa
    target_percent: int = Field(default=90, ge=50, le=99)
    # Bật/tắt tự động dọn ảnh khi đầy
    auto_cleanup: bool = True


class MqttSettingsIn(BaseModel):
    host: str = ""
    port: int = Field(default=1883, ge=1, le=65535)
    username: str = ""
    password: str = ""
    discovery_prefix: str = "homeassistant"
    base_topic: str = "iris"
    device_id: str = "iris_face_recognition"
    device_name: str = "IRIS Face Recognition"
    use_tls: bool = False


class TelegramSettingsIn(BaseModel):
    bot_token: str = ""
    chat_id: str = ""


class EventsBulkDeleteIn(BaseModel):
    ids: list[str] = Field(min_length=1, max_length=1000)
