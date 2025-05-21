FROM node:24-slim AS frontend

WORKDIR /app

COPY frontend/ ./frontend
WORKDIR /app/frontend

RUN npm install
RUN npm run build

# ---------- Backend Build Stage ----------
FROM golang:1.23 AS backend

WORKDIR /app

COPY . /app

RUN go build -o server /app/src

FROM debian:stable-slim

WORKDIR /app

COPY --from=backend /app/server /app/server

COPY --from=frontend /app/frontend/dist /app/static

EXPOSE 6969

CMD ["bash", "-c", "mkdir -p /app/data/texts; /app/server"]
