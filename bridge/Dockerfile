# Builds one image for both deployment modes: a Home Assistant add-on (Supervisor
# builds this file straight out of /addons) and a plain Docker service such as Coolify.
# entry.mjs works out which one it is at startup.

# Supervisor always passes --build-arg BUILD_FROM. This image pins its own Node base
# instead of using it, but the ARG is declared so the build does not warn about it.
ARG BUILD_FROM
FROM node:22-bookworm-slim

ARG CODEX_VERSION=0.152.0
RUN apt-get update \
    && apt-get install --yes --no-install-recommends bubblewrap ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && npm install --global "@openai/codex@${CODEX_VERSION}" \
    && npm cache clean --force

WORKDIR /app
COPY package.json server.mjs entry.mjs ./

# Runs as root on purpose. Supervisor mounts the add-on's persistent /data as root, so
# an unprivileged user could not write the Codex session or the generated bridge token.
ENV NODE_ENV=production \
    CODEX_HOME=/data/codex \
    CHEF_WORKSPACE=/data/workspace \
    PORT=8787

EXPOSE 8787

# No VOLUME declaration: Supervisor supplies /data for the add-on, and a Docker or
# Coolify deployment mounts its own. Declaring it here would fight both.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD ["node", "-e", "fetch('http://127.0.0.1:8787/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]
CMD ["node", "entry.mjs"]
