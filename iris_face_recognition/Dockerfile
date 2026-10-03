# Bản IRIS đã việt hóa + tự động xóa ảnh khi đầy.
# Giao diện (React) được build lại từ mã nguồn trong thư mục app/, phần chạy (Python, model, nginx)
# lấy từ image gốc để không phải cài lại thư viện nặng.

FROM node:24-bookworm-slim AS frontend-build

WORKDIR /app
COPY app/package.json app/package-lock.json ./
RUN npm ci

COPY app/ ./
RUN npm run build

FROM ghcr.io/anhnvme/facedetect:1.0.2

# Giao diện đã việt hóa
COPY --from=frontend-build /app/node_modules /app/node_modules
COPY --from=frontend-build /app/dist /app/dist
COPY app/package.json /app/package.json

# Backend đã nâng cấp (tự động dọn ảnh theo dung lượng, log tiếng Việt)
COPY app/backend/app /app/backend/app
COPY app/docker/web-server.mjs /app/docker/web-server.mjs
COPY app/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY app/docker/start.sh /app/docker/start.sh

COPY run.sh /run.sh
RUN chmod +x /run.sh /app/docker/start.sh

CMD ["/run.sh"]
