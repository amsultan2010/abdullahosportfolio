# abdullah-placeholder.com

my portfolio site. it's gone through a few lives.

**[live site](https://www.abdullah-placeholder.com/)** · **[desktop mode](https://www.abdullah-placeholder.com/desktop)**

![desktop mode](public/readme/portfolio-desktop.png)

---

## the story

this started the way most portfolios do - i copied my friend's. it was a basic landing page, a few links, nothing special. got the job done but didn't feel like mine.

then i got obsessed with the idea of building a full macOS desktop clone in the browser. menu bar, dock, draggable windows, boot screen, a working clock, live spotify widget, the whole thing. i wanted someone to land on my site and feel like they just opened a computer. it was fun to build but honestly, it was more of a flex than a portfolio. cool to look at, hard to actually navigate if you just wanted to know what i've built.

so i stripped it back. the current version is a clean single-page layout - projects, experience, writing, links. it loads fast, says what it needs to say, and gets out of the way. the macOS desktop still lives at `/desktop` for anyone who wants to explore it, but the main page is just simple and functional.

the lesson was that a portfolio should make the work easy to find, not be the work itself.

---

## what's in here

**main site (`/`)** - clean portfolio with projects, experience, writing, and links

**desktop mode (`/desktop`)** - full macOS desktop simulation
- boot screen with startup animation
- draggable, resizable app windows
- working menu bar, dock, and system clock
- live spotify now-playing widget
- terminal-style hero with typing animation

**blog + writing** - long-form posts on engineering, markets, and building

**api routes** - static placeholder endpoints

---

## tech

- astro 5 with server-side rendering
- react 19 for interactive components
- tailwind css
- three.js + react three fiber
- framer motion
- vercel deployment
- static placeholder data

---

## run locally

```bash
git clone https://github.com/abdullah-placeholder/abdullah-os.git
cd abdullah-os
npm install
npm run dev
```

opens at `http://localhost:4321`
