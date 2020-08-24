__The development docs are being updated currently. If you wish to self-host, please [see docs for self-hosting](/docs/self-host.md).__

## Local Development

### Celestial

The Docker setup employed uses a bind mount. While it should be fine to run this on a Windows or macOS host, I have not tested it and unfortunately cannot offer any support.

* `git clone git@github.com:hirusi/Celestial.git`
* `cd Celestial`

#### Setting up the environment

At this point, you'll need to try your hand at some configuration. Don't worry, none of this is not hard. Follow the instructions, and open an issue if you find someting to be confusing. 😊

##### Redis

Rename `redis.conf.example` to `redis.conf` in the `/conf` directory, then update the password on line 1. Keep the double quotes. You can generate one and paste it between these double quotes. This is where we tell Redis what password we want to use for the database.

__Tip__: Try to keep your password lengthy (18-24 or more characters) but omit special characters. Some can cause Redis to read the password only up to a point -- such as `hello` (interpreted password) for `hello$world` (the desired password).

##### Celestial

If you are deploying straight to Heroku, there is no need to create a `.env` file. Please skip to the next heading.

If you are self-hosting or developing locally, please continue reading this section.

Create a `.env` file at the root of this project and set up the following variables:

```
PORT=4000
NODE_ENV=development
TZ=Asia/Kolkata
REDIS_URL=redis://db0:YOUR_REDIS_PASSWORD_WITHOUT_QUOTES@redis:6379
```

If you are self-hosting, change the `NODE_ENV` to `production`.

##### IndieKit

In case you've set up [Indiekit](https://github.com/getindiekit/indiekit) from my [reference `docker-compose.yml` file](/docs/reference/indiekit/docker-compose.yml), create a `.env` file at the root of the `indiekit` directory, wherever you have cloned it and input the following variables.

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

You'll need an account on Heroku and `git` available locally.

* `heroku login`
* `heroku apps:create [name]`
* `heroku stack:set container`
* Configure two more environment variables by going to your app settings on Heroku:
  * `CLIENT_ID`: the domain where you are hosting this website
    * Example: `https://live-love-laugh.herokuapp.com/`
  * `REDIRECT_URI`: the domain where you are hosting this website followed by `login/callback/`
    * Example: `https://live-love-laugh.herokuapp.com/login/callback/`
* `git push heroku master`

### Micropub Server

I recommend [Indiekit](https://github.com/getindiekit/indiekit/) as a Micropub server should you be vibing a static site like I do. Please follow its setup instructions as well to get up and running. 🙂

Since I am already using Docker, I found it helpful to Docker-ify Indiekit.

You can find [its Dockerfile here](/docs/reference/indiekit/Dockerfile) and [the entrypoint file here](/docs/reference/indiekit/docker-entrypoint.sh). Copy both these files to wherever you cloned indiekit and keep them at its root.

You will also need to make the entrypoint file an executable:

```bash
cd path/to/indiekit
chmod a+x docker-entrypoint.sh
```

If you'd like to run Celestial along with Indiekit, you can find an example [`docker-compose.yml` file here](docs/reference/indiekit/docker-compose.yml).

### Running Tests

```
npm dev:test
```

On build/production environment, please use:

```
docker container exec celestial_web_1 npm run prod:test
```
