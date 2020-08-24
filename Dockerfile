FROM node:12

ENV TZ="Etc/UTC"
ENV NODE_ENV=production
ENV PORT=4000

# Sets up correct timezone
ENTRYPOINT ["docker-entrypoint.sh"]

# Update npm to the latest version available
RUN npm update -g npm

# Create /app directory
RUN mkdir /app

# Set working dir for RUN, CMD, COPY, ENTRYPOINT to /app
WORKDIR /app

# Copy package manifest
COPY package*.json ./

# Install node modules
RUN npm ci

# Copy all the files, except those in .dockerignore
COPY ./ ./
COPY tsconfig.json ./

# Build dist files
RUN npm run build

# Remove src files
RUN rm -rf src gulp_tasks docs
RUN rm .prettierrc .nvmrc .prettierignore .editorconfig .babelrc tsconfig.json webpack.config.js setupTests.js gulpfile.esm.js heroku.yml .tsbuildinfo

# Instruct the container to execute this by default
CMD ["node", "index.js"]

# Expose the port the app starts on, so it can be accessed from outside the container
# Not supported on Heroku, which directly expects our app to use $PORT to run - potential but unlikely conflict with ENV PORT defined above
EXPOSE $PORT