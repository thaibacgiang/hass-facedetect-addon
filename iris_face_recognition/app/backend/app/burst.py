"""Chụp liên tiếp nhiều khung hình khi camera được kích hoạt.

Vấn đề cũ: mỗi lần bấm nút chỉ chụp đúng 1 ảnh ngay lúc bấm. Lúc đó người thường chưa
đứng vào khung hình / chưa quay mặt về camera nên kết quả là "không thấy khuôn mặt".

Cách mới: chụp lại nhiều lần cách nhau vài trăm mili-giây tới vài giây, dừng ngay khi nhận
ra người quen, nếu không thì giữ khung hình tốt nhất (có mặt, giống nhất, mặt to nhất).

Module này không phụ thuộc FastAPI/InsightFace (nhận hàm qua tham số) nên dễ kiểm thử.
"""
from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Callable


@dataclass
class Frame:
    image: bytes
    suffix: str
    has_face: bool = False
    similarity: float = 0.0  # độ giống cao nhất với người đã đăng ký (0-100)
    face_area: float = 0.0  # diện tích khuôn mặt (0-1, so với cả ảnh)


@dataclass
class BurstResult:
    best: Frame | None  # khung hình tốt nhất có khuôn mặt (None nếu không khung nào có mặt)
    last: Frame | None  # khung hình cuối cùng đã chụp (dùng khi không thấy mặt)
    tried: int  # số khung hình đã phân tích
    face_frames: int  # số khung hình có khuôn mặt
    stopped_early: bool  # dừng sớm vì đã nhận ra người quen


def _score(frame: Frame) -> tuple[int, float, float]:
    return (1 if frame.has_face else 0, frame.similarity, frame.face_area)


def better(candidate: Frame, current: Frame | None) -> bool:
    return current is None or _score(candidate) > _score(current)


def run_burst(
    fetch: Callable[[], tuple[bytes, str]],
    probe: Callable[[bytes], tuple[bool, float, float]],
    *,
    max_frames: int = 5,
    interval: float = 1.0,
    accept_threshold: float = 55.0,
    first_frame: tuple[bytes, str] | None = None,
    sleep: Callable[[float], None] = time.sleep,
) -> BurstResult:
    """Chụp tối đa `max_frames` khung hình.

    fetch: lấy 1 ảnh tĩnh từ camera -> (bytes, đuôi file). Lỗi ở khung đầu tiên sẽ ném ra
           ngoài; lỗi ở các khung sau chỉ dừng vòng lặp và dùng những gì đã có.
    probe: phân tích 1 ảnh -> (có_mặt, độ_giống, diện_tích_mặt).
    accept_threshold: độ giống đạt ngưỡng này thì dừng sớm.
    first_frame: ảnh đã chụp sẵn (chế độ tự động quét) để khỏi chụp lại khung đầu.
    """
    max_frames = max(1, int(max_frames))
    interval = max(0.0, float(interval))
    best: Frame | None = None
    last: Frame | None = None
    tried = 0
    face_frames = 0
    stopped_early = False

    for index in range(max_frames):
        if index == 0 and first_frame is not None:
            image, suffix = first_frame
        else:
            if index > 0:
                sleep(interval)
            try:
                image, suffix = fetch()
            except Exception:
                if last is None:
                    raise
                break  # camera chập chờn giữa chừng: dùng các khung đã có

        has_face, similarity, area = probe(image)
        frame = Frame(image, suffix, bool(has_face), float(similarity or 0.0), float(area or 0.0))
        last = frame
        tried += 1
        if frame.has_face:
            face_frames += 1
            if better(frame, best):
                best = frame
            if frame.similarity >= accept_threshold:
                stopped_early = True
                break

    return BurstResult(best=best, last=last, tried=tried, face_frames=face_frames, stopped_early=stopped_early)
