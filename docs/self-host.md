# Publishing to a self-hosted production environment

This document assumes you will be using `docker-compose` to run Celestial. We use a Redis database to manage sessions, therefore, `docker-compose` is a natural choice.

Heroku instructions will be provided in the future in a separate documentation file.

## Micropub Client

### Setting up the environment

At this point, you'll need to try your hand at some configuration. Don't worry, none of this is hard. Follow the instructions, and feel free open an issue if you find someting to be confusing. 😊

#### Celestial

* `git clone git@github.com:hirusi/Celestial.git`
* `cd Celestial`

## Micropub Server

I recommend [Indiekit](https://github.com/getindiekit/indiekit/) as a Micropub server should you be vibing a static site like I do. Please follow its setup instructions as well to get up and running. Currently, the instructions below apply for the v0.0.x tag series.

Since I am already using Docker, I found it helpful to Docker-ify Indiekit.

You can find [its Dockerfile here](/docs/reference/indiekit/Dockerfile) along with a `docker-entrypoint.sh` script. __Copy both of these to wherever you cloned Indiekit and keep them at its root.__

## Going live

We're almost there!

Build a local image for Indiekit:

```
cd path/to/indiekit
docker build . -t indiekit:0.0.3
```

Now let's make sure our `docker-compose.yml` is all set up. This will let us bring Celestial, Redis, and Indiekit all with one command as well as let them talk to each other.

You can find an example [`docker-compose.yml` file here](docs/reference/with-indiekit/docker-compose.yml).

You must generate a password and replace `RANDOMLY_GENERATED_PASSWORD` everywhere in the file.

__Tip__: Try to keep the password lengthy (18-24 or more characters) but omit special characters. Some can cause Redis to read the password only up to a point -- such as `hello` (interpreted password) for `hello$world` (the desired password).

When you're all set, just run: `docker-compose up -d --remove-orphans`