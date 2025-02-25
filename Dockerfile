FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package.json 和 lock 文件
COPY package.json pnpm-lock.yaml .npmrc ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install

# 复制源代码
COPY . .

# 构建项目
RUN pnpm build

# 生产环境镜像
FROM node:18-alpine

WORKDIR /app

# 设置环境变量，可在运行容器时覆盖
ENV PORT=4444
# 不设置敏感信息的默认值，仅声明变量
ENV APIFOX_USER_ACCESS_TOKEN=""

# 复制 package.json 和 lock 文件
COPY package.json pnpm-lock.yaml .npmrc ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装生产依赖和 dotenv 模块
RUN pnpm install --prod && pnpm add dotenv

# 从构建阶段复制编译后的代码
COPY --from=builder /app/lib ./lib

# 暴露端口（默认 4444，可通过环境变量覆盖）
EXPOSE ${PORT}

# 启动服务
CMD ["node", "lib/index.js"]
