# Celestial

I am building this __Micropub client__ with a few goals in mind:

- Be as spec-compliant as possible.
- Look good and support system-based dark mode.
- Make self-hosting as easy as configuring environment variables followed by `docker-compose up`.
- Make IndieWeb accessible to less technically inclined folks.
- To make something useful for myself and others while I figure out and learn backend content.

If you'd like to show me some support, please star the project. ♥

Although spec compliance should ensure it works with any Micropub server, I will only be testing this with [Indiekit](https://github.com/getindiekit/indiekit/ "indiekit"). Paul Robert Lloyd is currently working on its successor. If you use a different Micropub server and face a problem, please open an issue and I'll see how best I can fix it.

A [demo site](https://micropub-celestial.herokuapp.com/) is available through Heroku. Currently deployed commit: [#18a882](https://github.com/hirusi/Celestial/commit/18a8826d45d8e170414b1cb434973a25867330be).

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
    - [x] 📔 [Note](https://indieweb.org/note)
    - [ ] ↪ [Reply](https://indieweb.org/reply)
    - [ ] ↪ [Reply with RSVP](https://indieweb.org/rsvp)
    - [ ] ♥ [Like](https://indieweb.org/like)
    - [ ] ♺ [Repost](https://indieweb.org/repost)
    - [ ] 📷 [Photo](https://indieweb.org/photo)
    - [ ] 🎥 [Video](https://indieweb.org/video)
    - [ ] 📅 [Event](https://indieweb.org/event)
- [ ] Micropub extensions
    - [ ] [Query for supported post types](https://indieweb.org/Micropub-extensions#Query_for_Supported_Vocabulary)
    - [x] [Slug](https://indieweb.org/Micropub-extensions#Slug)
    - [ ] [Query for category/tag list](https://indieweb.org/Micropub-extensions#Query_for_Category.2FTag_List)
    - [ ] [Query for post list](https://indieweb.org/Micropub-extensions#Query_for_Post_List)
- [ ] Design and polish
    - [ ] Consistent spacing
    - [ ] Design for more breakpoints (tablets, specifically) if the need is seen
    - [ ] Better forms UI/UX
    - [ ] Sprinkle helpful hints throughout the app, let the user turn them off in preferences

### Moving forward to v2.0

- [ ] Rely on our own code instead of external libraries for menial tasks. Reduce dependencies and allow the project to be maintainable in the long run.
- [ ] Add an inline/split Markdown preview for supported post types.
- [ ] Full-width layout for a better and familiar publishing experience.
- [ ] Add experimental (non-spec) support for the following post types:
    - [ ] 🚩 [Checkin](https://indieweb.org/checkin)
    - [ ] 🔖 [Bookmark](https://indieweb.org/bookmark)
    - [ ] 🎤 [Audio](https://indieweb.org/audio)

## Usage

__Not ready for public use.__

Detailed development instructions are [availble in the docs](/docs/development.md).

## Limitations of the public example server

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
