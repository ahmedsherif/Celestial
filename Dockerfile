FROM node:12

ENV TZ="Asia/Kolkata"
ENV NODE_ENV=production
# ! I suspect the port is anyway overriden by Heroku, but this helps us test the image locally.
ENV PORT=4000

# Set up correct timezone
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Update npm to the latest version available
RUN npm update -g npm

# Create /app directory
RUN mkdir /app

# Set working dir for RUN, CMD, COPY, ENTRYPOINT to /app
WORKDIR /app

# Copy package manifest
COPY package*.json ./

# Install node modules
RUN npm install

# Copy all the files, except those in .dockerignore
COPY ./ ./

# Build dist files
RUN npm run build

# Remove src files
RUN rm -rf src gulp_tasks docs
RUN rm .prettierrc .nvmrc .prettierignore .editorconfig .babelrc tsconfig.json webpack.config.js setupTests.js

# Instruct the container to execute this by default
CMD ["node", "index.js"]

# Expose the port the app starts on, so it can be accessed from outside the container
# Not supported on Heroku, which directly expects our app to use $PORT to run
# Potential conflict with ENV PORT defined above
EXPOSE $PORT