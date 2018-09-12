FROM node:10.10.0-alpine

# Install global NPM under local user
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin

# Add Tini (So node can handle being PID 1) See https://github.com/krallin/tini
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

# Create app directory
WORKDIR /app

# Set ENV's
ENV NODE_ENV production

# Copy
COPY package*.json ./
RUN npm install
COPY src /app/src
COPY bin /app/bin

# Do not run as root, run as the image-supplied node-user.
USER node

# Start command
CMD ["node", "/app/bin/collector.js", "--config-file", "/config/config.js" ]
