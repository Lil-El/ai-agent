# 构建阶段：需要 devDependencies（含 @nestjs/cli、typescript）才能 nest build，但是生产阶段不需要 devDependencies ，所以分为两个阶段构建，第一阶段安装 devDependencies 并构建，第二阶段只安装生产依赖并运行。这样可以减小最终镜像的体积。
# 指定基础镜像
FROM node:22.17.0 AS builder

# 指定工作目录
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


# 运行阶段
FROM node:22.17.0

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]