# Publishing to a self-hosted production environment

This document assumes you will be using `docker-compose` to run Celestial. We use a Redis database to manage sessions, therefore, `docker-compose` is a natural choice.

You'll need to try your hand at some configuration. Don't worry, none of this is hard. Follow the instructions, and feel free open an issue if you find someting to be confusing. Chances are other people do too, and we can improve these docs together! 😊🎉

__Heroku instructions will be provided in the future in a separate documentation file.__

## Micropub Client - Celestial

* `git clone git@github.com:hirusi/Celestial.git`

## Micropub Server - Indiekit

I recommend [Indiekit](https://github.com/getindiekit/indiekit/) as a Micropub server should you be vibing a static site like I do. Please follow its setup instructions as well to get up and running. Currently, the instructions below apply for the v0.0.x tag series.

* `git clone git@github.com:getindiekit/indiekit`
* `cd indiekit`
* Since I am already using Docker, I found it helpful to Docker-ify Indiekit. You can find [its Dockerfile here](/docs/reference/indiekit/Dockerfile) along with a `docker-entrypoint.sh` script. __Copy both of these to wherever you cloned Indiekit and keep them at its root:__  `cp -r path/to/celestial/docs/reference/indiekit .`
* Build a local image for Indiekit: `docker build . -t indiekit:0.0.3`

## Going live

We're almost there!

Let's make sure our `docker-compose.yml` is all set up. This will let us bring Celestial, Redis, and Indiekit all with one command as well as let them talk to each other.

* You can find an example [`docker-compose.yml` file here](/docs/reference/with-indiekit/docker-compose.yml) to work from, or copy it from the command line and the make changes: `cp path/to/Celestial/docs/references/with-indiekit/docker-compose.yml path/to/Celestial/`
* You must generate a password and replace `RANDOMLY_GENERATED_PASSWORD` everywhere in the file. This is the password to Redis.
  * __Tip__: Try to keep the password lengthy (18-24 or more characters) but omit special characters. Some can cause Redis to read the password only up to a point -- such as `hello` (interpreted password) for `hello$world` (the desired password).
* Make sure you also configure the environment variables required by Indiekit.
* When you're all set, just run: `docker-compose up -d --remove-orphans`


## Troubleshooting

- You will also need to make the entrypoint file an executable. Please repeat for Indiekit.
  ```bash
  cd path/to/Celestial
  chmod a+x docker-entrypoint.sh
  ```
