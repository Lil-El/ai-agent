# OSS

## minio

要给 `Bucket` 的 `Anonymous Access` 设置一个 `Prefix`，才可以使用 `9000/[bucket_name]/[file_name]` 访问

```yml
version: "3.8"

services:
  minio:
    image: minio/minio:RELEASE.2025-04-22T22-12-26Z
    container_name: minio
    ports:
      - "9000:9000" # S3 对象存储API端口（程序对接用）
      - "9001:9001" # Web图形控制台端口（浏览器访问UI）
    environment:
      MINIO_ROOT_USER: admin
      MINIO_ROOT_PASSWORD: Admin@123456
    volumes:
      - ./minio-data:/data
    command: server /data --console-address ":9001"
    restart: unless-stopped

```

## s3

`Bucket` 设置`访问策略`为`公有`，才可以使用 `9000/[bucket_name]/[file_name]` 访问

```yml
version: "3.8"

services:
  rustfs:
    image: rustfs/rustfs:latest
    container_name: rustfs-server
    restart: always
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      TZ: Asia/Shanghai
      RUSTFS_ACCESS_KEY: admin
      RUSTFS_SECRET_KEY: Admin@123456
      RUSTFS_CONSOLE_ENABLE: "true"
    volumes:
      - ./volumes/rustfs-data:/data
      - ./volumes/rustfs-logs:/logs

```