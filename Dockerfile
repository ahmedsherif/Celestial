FROM node:12

ENV TZ="Europe/London"

# Set up correct timezone
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Update npm to the latest version available
RUN npm update -g npm

# Set working dir for RUN, CMD, COPY, ENTRYPOINT to /app
WORKDIR /app

# Copy package manifest
COPY package*.json ./

# Clean install
RUN npm ci

# Copy all the files, except those in .dockerignore
COPY ./ ./

# Build dist files
RUN npm run build

# Remove src files
RUN rm -rf src gulp_tasks docs
RUN rm .prettierrc .nvmrc .prettierignore .editorconfig .babelrc tsconfig.json webpack.config.js

# Instruct the container to execute this by default
CMD ["node", "index.js"]

# Expose the port the app starts on, so it can be accessed from outside the container
EXPOSE $PORT