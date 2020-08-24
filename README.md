# Celestial

The [IndieWeb](https://indieweb.org/) is a movement to decentralize the social web.

<blockquote cite="https://micropub.spec.indieweb.org/"><p>The Micropub protocol is used to create, update and delete posts on one's own domain using third-party clients. Web apps and native apps (e.g., iPhone, Android) can use Micropub to post and edit articles, short notes, comments, likes, photos, events or other kinds of posts on your own website.</p><footer>&mdash; <cite>Micropub specification</cite></footer></blockquote>

You may [view the full specification here](https://micropub.spec.indieweb.org/). I am building this __Micropub client__ with a few goals in mind:

- Be as spec-compliant as possible.
- Look good and support system-based dark mode.
- Make self-hosting as easy as configuring environment variables followed by `docker-compose up`.
- Make IndieWeb accessible to less technically inclined folks.
- To make something useful for myself and others while I figure out and learn backend content.

If you'd like to show me some support, please star the project. ♥

Although spec compliance should ensure it works with any Micropub server, I will only be testing this with [Indiekit](https://github.com/getindiekit/indiekit/ "indiekit"). Paul Robert Lloyd is currently working on its successor. If you use a different Micropub server and face a problem, please open an issue and I'll see how best I can fix it.

A [demo site](https://micropub-celestial.herokuapp.com/) is available through Heroku. __Please note that the demo may not be the latest available version.__

## To-Do

### Until we reach v1.0

- [x] Set up infrastructure with a welcome page
- [x] IndieAuth spec compliance
    - [x] Authorization
        - [x] Complete all requirements as laid out by the spec
        - [ ] Comply with changes to IndieAuth as on 2020/08/09
- [ ] Micropub spec compliance - [being tracked here](https://github.com/hirusi/Celestial/issues/4).
- [ ] General resilience tasks
    - [x] Use a logging library like `winston`
    - [x] Unit testing
    - [ ] Modular codebase (as many smaller & side-effects-free functions as possible without compromising readability)
    - [ ] [Express security checklist](https://expressjs.com/en/advanced/best-practice-security.html)
    - [ ] [Redis security checklist](https://redis.io/topics/security)
- [ ] Polish
    - [ ] Design
        - [ ] Consistent spacing
        - [ ] Work with page zoom as well as base font size in browser settings
        - [ ] Design for more breakpoints (tablets, specifically) if the need is seen
    - [ ] Forms
        - [ ] Single page for article/note (title vs no-title)
        - [ ] Single page for like/repost (radiobox to pick between)
    - [ ] Sprinkle helpful hints throughout the app

### Moving forward to v2.0

- [ ] Rely on our own code instead of external libraries for menial tasks. Reduce dependencies and allow the project to be maintainable in the long run.
- [ ] Docker image based on `node:version-alpine`
- [ ] Add an inline/split Markdown preview for supported post types.
- [ ] Full-width layout for a better and familiar publishing experience.
- [ ] Option for user to turn off helpful hints in preferences (for advanced users)
- [ ] Add experimental (non-spec) support for the following post types:
    - [ ] 🚩 [Checkin](https://indieweb.org/checkin)
    - [ ] 🔖 [Bookmark](https://indieweb.org/bookmark)
    - [ ] 🎤 [Audio](https://indieweb.org/audio)
    
### Moving forward to v3.0

- [ ] Break IndieAuth implementation into a module

## Usage

Although I __do not consider this ready for public use__, you are welcome [to self-host](/docs/self-host.md).

Detailed [development instructions are available](/docs/development.md).

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
