## Local Development

### Celestial

The Docker setup employed uses a bind mount. While it should be fine to run this on a Windows or macOS host, I have not tested it and unfortunately cannot offer any support.

* `git clone git@github.com:hirusi/Celestial.git`
* `cd Celestial`

#### Setting up the environment

At this point, you'll need to set up some environment variables.

##### Redis

Update the database password in `/conf/redis.conf`:

```
1 requirepass "a_random_password_here_without_removing_quotes"
2 appendonly yes
```

__Tip__: Try to keep your password lengthy (18-24 or more characters) but omit special characters. Some can cause Redis to read the password only up to a point -- such as `hello` (interpreted password) for `hello$world` (the desired password).

##### Celestial

Create a `.env.celestial` file at the root of this project and set up the following variables:

```
PORT=4000
NODE_ENV=development
TZ=Asia/Kolkata
REDIS_URL=redis://db0:YOUR_REDIS_PASSWORD_WITHOUT_QUOTES@redis:6379
```

##### IndieKit

In case you've set up Indiekit from my [reference `docker-compose.yml` file](/docs/reference/indiekit/docker-compose.yml), create a `.env` file at the root of the `indiekit` directory, wherever you have cloned it and input the following variables.

```
PORT=3000
NODE_ENV=development
TZ=Asia/Kolkata
GITHUB_REPO=
GITHUB_TOKEN=
GITHUB_USER=
GITHUB_BRANCH=
INDIEKIT_CONFIG_PATH=
INDIEKIT_LOCALE=
INDIEKIT_URL=
```

#### Going live locally

For the final magic, let's bring up all our services:

* `docker-compose up --build --remove-orphans`

#### Publishing to Heroku

Heroku expects the `node_modules` available within the built image. It cannot unfortunately use a bind mount for the source files to build from. So I've built a self contained image of the distribution files.

You might notice that I run `npm ci` on the Dockerfile, which greatly limits the portability of the Docker image to just the host on which the image was built and distributed from. 

I'm happy to accept PRs to work out a better flow.

You'll need an account on Heroku.

* `heroku login`
* `heroku apps:create [name]`
* `heroku container:login`
* `heroku container:push web`
* Set up Redis on Heroku.
  * Add Redis to your Heroku app's resources.
  * It will create a `REDIS_URL` environment variable by itself.
* Configure two more environment variables by going to your app settings on Heroku:
  * `CLIENT_ID`: the domain where you are hosting this website
    * Example: `https://live-love-laugh.herokuapp.com/`
  * `REDIRECT_URI`: the domain where you are hosting this website followed by `login/callback/`
    * Example: `https://live-love-laugh.herokuapp.com/login/callback/`
* `heroku container:release web`

### Micropub Server

I recommend [Indiekit](https://github.com/getindiekit/indiekit/) as a Micropub server should you be vibing a static site like I do. Please follow its setup instructions as well to get up and running. 🙂

Since I am already using Docker, I found it helpful to Docker-ify Indiekit.

You can find [its Dockerfile here](/docs/reference/indiekit/Dockerfile) and [the entrypoint file here](/docs/reference/indiekit/docker-entrypoint.sh). Copy both these files to wherever you cloned indiekit and keep them at its root.

You will also need to make the entrypoint file an executable:

```bash
cd path/to/indiekit
chmod +x docker-entrypoint.sh
```

If you'd like to run Celestial along with Indiekit, you can find an example [`docker-compose.yml` file here](docs/reference/indiekit/docker-compose.yml).

### Running Tests

```
docker container exec celestial_web_1 npm test
```
