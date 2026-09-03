FROM node:22-bookworm-slim

ARG CODEX_VERSION=0.152.0
RUN apt-get update \
    && apt-get install --yes --no-install-recommends bubblewrap ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && npm install --global "@openai/codex@${CODEX_VERSION}" \
    && npm cache clean --force

WORKDIR /app
COPY package.json server.mjs ./

RUN mkdir -p /data/codex /data/workspace \
    && chown -R node:node /app /data

USER node
ENV NODE_ENV=production \
    CODEX_HOME=/data/codex \
    CHEF_WORKSPACE=/data/workspace \
    PORT=8787

EXPOSE 8787
VOLUME ["/data/codex"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD ["node", "-e", "fetch('http://127.0.0.1:8787/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]
CMD ["node", "server.mjs"]
