---
title: Docker 容器化部署实战
summary: 从 Dockerfile 编写到 Docker Compose 编排，掌握容器化部署的核心知识。
date: 2026-05-10
tags: [Docker, DevOps, 部署]
---

容器化技术已经成为现代应用部署的标准方式。Docker 让应用的构建、分发和运行变得简单可靠。

## Dockerfile 最佳实践

### 多阶段构建

使用多阶段构建可以显著减小镜像体积：

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 运行阶段
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --production
EXPOSE 3000
CMD ["npm", "start"]
```

### 镜像优化

- 使用 Alpine 基础镜像
- 合并 RUN 指令减少层数
- 利用 .dockerignore 排除不必要文件
- 合理利用构建缓存

## Docker Compose

对于多服务应用，Docker Compose 提供了简洁的编排方式。

## 健康检查

配置健康检查确保容器处于可用状态。

## 日志管理

- 应用日志输出到 stdout/stderr
- 使用日志驱动收集日志
- 配置日志轮转避免磁盘占满

## 总结

容器化不仅简化了部署流程，也让应用的可移植性和一致性得到了保障。
