# Local Development

__If you wish to self-host, please [see the docs for self-hosting](/docs/self-host.md).__

At the moment, much of what you do to self-host is what much of you need to do to get a development environment going - all thanks to Docker!

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
* When you're all set, just run: `docker-compose up --build --remove-orphans`

### Using a bind-mount to quickly mirror local changes to Docker env

__TODO__

## Troubleshooting

- You will also need to make the entrypoint file an executable. Please repeat for Indiekit.
  ```bash
  cd path/to/Celestial
  chmod a+x docker-entrypoint.sh
  ```

## Publishing to Heroku

__TODO: To be moved to a separate file.__

You'll need an account on Heroku and `git` available locally.

* `heroku login`
* `heroku apps:create [name]`
* `heroku stack:set container`
* Configure two more environment variables by going to your app settings on Heroku:
  * `CLIENT_ID`: the domain where you are hosting this website
    * Example: `https://live-love-laugh.herokuapp.com/`
  * `REDIRECT_URI`: the domain where you are hosting this website followed by `login/callback/`
    * Example: `https://live-love-laugh.herokuapp.com/login/callback/`
* `heroku git:remote -a [name]`
* `git push heroku master`

## Running Tests

```bash
npm run dev:tests
```

On production environments, please use:

```bash
npm run prod:tests
```

### Troubleshooting

- Switching between Docker and non-Docker environments can cause issues with file permissions. If you are unable to access certain files, run `sudo chown -R $USER:$USER .`
