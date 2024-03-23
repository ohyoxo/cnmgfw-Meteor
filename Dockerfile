FROM node:slim

WORKDIR /app

COPY . .

# 使用Galaxy平台推荐的端口
ENV PORT=3000
EXPOSE 3000

# 安装依赖和应用程序
RUN apt update -y &&\
    chmod +x index.js &&\
    npm install

# 确保应用监听$PORT环境变量指定的端口
CMD ["node", "index.js"]
