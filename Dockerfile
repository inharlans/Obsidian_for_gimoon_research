FROM node:24.13-bookworm-slim

ENV NODE_ENV=production
WORKDIR /app

RUN corepack enable && mkdir -p /data/PaperKG && chown -R node:node /data

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json vitest.config.ts ./
COPY packages ./packages

RUN pnpm install --frozen-lockfile --prod=false && pnpm --filter @paperkg/mcp... build

USER node
EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:8787/ready').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]

ENTRYPOINT ["pnpm", "exec", "tsx", "packages/mcp/src/index.ts", "http"]
CMD ["--vault", "/data/PaperKG", "--host", "0.0.0.0", "--port", "8787"]
