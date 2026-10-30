FROM node:24-bookworm-slim
WORKDIR /app
RUN npm install -g pnpm@11.25.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build && mkdir -p /data && chown node:node /data
USER node
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4173 DATA_DIR=/data
EXPOSE 4173
CMD ["node","--import","tsx","server/start.ts"]
