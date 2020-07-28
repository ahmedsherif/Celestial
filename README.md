# Celestial

I am building this __Micropub client__ with a few goals in mind:

- Be as spec-compliant as possible.
- Look good and support system-based dark mode.
- Make self-hosting as easy as configuring environment variables followed by `docker-compose up`.
- Make IndieWeb accessible to less technically inclined folks.
- To make something useful for myself and others while I figure out and learn backend content.

Although spec compliance should ensure it works with any Micropub server, I will only be testing this with [Indiekit](https://github.com/getindiekit/indiekit/ "indiekit"). Paul Robert Lloyd is currently working on its successor.

## To-Do

### Until we reach v1.0

- [x] Set up infrastructure with a welcome page
- [x] IndieAuth spec compliance
    - [x] Authorization
        - [x] Basic usage with a sample `create` scope
        - [x] Complete all requirements as laid out by the spec
- [ ] Micropub spec compliance
    - [x] [Endpoint discovery](https://www.w3.org/TR/micropub/#endpoint-discovery)
    - [ ] [Create](https://www.w3.org/TR/micropub/#create)
        - [x] `application/x-www-form-urlencoded`
        - [ ] `form/multipart`
        - [ ] `JSON`
    - [ ] [Update](https://www.w3.org/TR/micropub/#create)
    - [ ] [Delete](https://www.w3.org/TR/micropub/#create)
    - [ ] [Media endpoint](https://www.w3.org/TR/micropub/#media-endpoint)
    - [x] [Query server for configuration](https://www.w3.org/TR/micropub/#configuration)
    - [x] [Syndication targets](https://www.w3.org/TR/micropub/#syndication-targets)
- [ ] General resilience tasks
    - [x] Use a logging library like `winston`
    - [ ] Modular codebase
    - [ ] Best practices
    - [ ] [Express security checklist](https://expressjs.com/en/advanced/best-practice-security.html)
    - [ ] [Redis security checklist](https://redis.io/topics/security)
    - [ ] Unit testing
- [ ] [Types of posts](https://indieweb.org/posts#Types_of_Posts) to be supported:
    - [ ] 📄 [Article](https://indieweb.org/article)
    - [ ] 📔 [Note](https://indieweb.org/note)
    - [ ] ↪ [Reply](https://indieweb.org/reply)
    - [ ] ↪ [Reply with RSVP](https://indieweb.org/rsvp)
    - [ ] ♥ [Like](https://indieweb.org/like)
    - [ ] ♺ [Repost](https://indieweb.org/repost)
    - [ ] 📷 [Photo](https://indieweb.org/photo)
    - [ ] 🎥 [Video](https://indieweb.org/video)
    - [ ] 📅 [Event](https://indieweb.org/event)
- [ ] Micropub extensions
    - [ ] [Query for supported post types](https://indieweb.org/Micropub-extensions#Query_for_Supported_Vocabulary)
    - [ ] [Slug](https://indieweb.org/Micropub-extensions#Slug)
    - [ ] [Query for category/tag list](https://indieweb.org/Micropub-extensions#Query_for_Category.2FTag_List)
- [ ] Design and polish
    - [ ] Consistent spacing
    - [ ] Design for more breakpoints (tablets, specifically) if the need is seen
    - [ ] Better forms UI/UX
    - [ ] Sprinkle helpful hints throughout the app, let the user turn them off in preferences

### Moving forward to v2.0

- [ ] Rely on our own code instead of external libraries for menial tasks. Reduce dependencies and allow the project to be maintainable in the long run.
- [ ] Idea: Add an inline/split Markdown preview for supported post types.
- [ ] Add experimental (non-spec) support for the following post types:
    - [ ] 🚩 [Checkin](https://indieweb.org/checkin)
    - [ ] 🔖 [Bookmark](https://indieweb.org/bookmark)
    - [ ] 🎤 [Audio](https://indieweb.org/audio)

## Usage

__Not ready for public use.__

You are encouraged to self-host this web application. While you can use the example server hosted on Heroku, you may run into some limitations.

* `git clone git@github.com:hirusi/splisher.git`
* `heroku apps:create [name]`
* `git push heroku master`

### Limitations

* I have implemented a strong Content Security Policy, and only allow the browser to load images from certain specified domains. This will **not** be changed to accomodate your domain.
    * **Workaround**: If you self-host, it's easy to add a new domain to the list of allowed domains. This will nicely show your profile photo (based on microformats2) once you log in. To do this, head over to the `src/index.ts` file and change the following block to include your domain:
    ```
    // Set up a CSP
    const directives = {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://twemoji.maxcdn.com/"],
        imgSrc: ["'self'", "https://twemoji.maxcdn.com/", "https://yourdomain.com"],
    };
    ```
* In the event the example server runs into excessive traffic, it will not scale. I have aimed to make self-hosting easy for exactly this reason. If you are facing any issue in doing so, please open an issue on the repository and someone should be able to help you.

## Local Development

### Celestial

The Docker setup employed uses a bind mount. It is intended to only run on Linux hosts. However, you should be fine running it on a Windows or macOS host.

* `git clone git@github.com:hirusi/Celestial.git && cd Celestial`
* `docker-compose up --build --remove-orphans`

### Micropub Server

I recommend [Indiekit](https://github.com/getindiekit/indiekit/) as a Micropub server should you be vibing a static site like I do. Please follow its setup instructions as well to get up and running. 🙂

Since I am already using Docker, I found it helpful to Docker-ify Indiekit.

You can find [its Dockerfile here](docs/reference/indiekit/Dockerfile) and [the entrypoint file here](docs/reference/indiekit/docker-entrypoint.sh). Copy both these files to wherever you cloned indiekit and keep them at its root.

You will also need to make the entrypoint file an executable:

```bash
cd path/to/indiekit
chmod +x docker-entrypoint.sh
```

If you'd like to run Celestial along with Indiekit, you can find an example [`docker-compose.yml` file here](docs/reference/indiekit/docker-compose.yml).

### Running Tests

```
docker container celestial_web_1 exec npm test
```
