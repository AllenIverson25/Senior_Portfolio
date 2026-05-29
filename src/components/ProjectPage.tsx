import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink, Anchor, Code2, Lightbulb, Wrench, BookOpen } from 'lucide-react';

interface ProjectData {
  title:        string;
  year:         string;
  tag:          string;
  skills:       string[];
  image:        string;
  liveUrl:      string;
  overview:     string;
  accent:       string;
  languages:    { name: string; detail: string }[];
  concepts:     { name: string; detail: string }[];
  tools:        string[];
  learned:      string[];
  challenge:    string;
  reflection:   string;
}

const PROJECTS: Record<string, ProjectData> = {
  'aruba': {
    title:     'Aruba',
    year:      'Sophomore',
    tag:       'Travel Site',
    skills:    ['HTML5', 'CSS3', 'Layout Design', 'Navigation'],
    image:     '/aruba.png',
    liveUrl:   'https://7cdd20f1-1fce-4fbb-8e78-bd96efff519a-00-1qwayp5fnecvj.kirk.replit.dev/index.html',
    accent:    '#2E86C1',
    overview:  'A fully designed travel guide website for the island of Aruba. Built during my sophomore year, this was one of my first "real" websites — complete with a styled navigation bar, hero photography, and dedicated pages for restaurants, hotels, and sightseeing.',
    languages: [
      { name: 'HTML5', detail: 'Used semantic elements like <nav>, <header>, <section>, and <footer> to structure the page correctly. Learned how elements nest and how to build a multi-page site with separate HTML files linked together.' },
      { name: 'CSS3',  detail: 'Styled everything from the navigation bar to full-bleed hero images. Worked extensively with margins, padding, border-radius, and color properties. This was my first time truly understanding the box model.' },
    ],
    concepts: [
      { name: 'Multi-page Architecture',    detail: 'Organized the site into separate HTML files (Home, Info, Restaurants, Hotels, Sightseeing) and connected them via anchor tags in a shared navigation bar.' },
      { name: 'Navigation Bar Design',      detail: 'Built a sticky top navbar with logo, links, and a search input. Learned how to use display: flex to align elements horizontally and style hover states.' },
      { name: 'Hero Sections & Imagery',    detail: 'Created full-width hero sections with background imagery and overlaid text. Practiced using background-size: cover and positioning to make photos look professional.' },
      { name: 'CSS Color Theory',           detail: 'Chose a tropical palette that matched the Aruba brand — blues, teals, and warm sand tones. Learned how color consistency across pages creates a cohesive experience.' },
    ],
    tools:      ['VS Code', 'Chrome DevTools', 'Google Fonts', 'Replit'],
    learned: [
      'How to plan and structure a multi-page website before writing a single line of code',
      'The CSS box model — margin, border, padding — and why it controls everything on a page',
      'How to make a navigation bar that actually works and looks good',
      'Using hero images with text overlays to create visual impact',
      'That web design is equal parts code AND visual thinking',
    ],
    challenge:  'Getting the hero image to sit behind the text without obscuring it. I had to learn about z-index and CSS positioning (relative/absolute) to solve this.',
    reflection: 'Aruba was where I realized I actually loved building things for the web. It was the first site I showed people and felt proud of — not just because it worked, but because it looked like something real.',
  },

  'album-covers': {
    title:     'My Favorite Album Covers',
    year:      'Sophomore',
    tag:       'Responsive Gallery',
    skills:    ['Responsive Design', 'CSS Grid', 'HTML5', 'Visual Hierarchy'],
    image:     '/album_cover.png',
    liveUrl:   'https://bbf66889-2c88-4d3a-b631-43f90b475159-00-1nz2j53oqczx0.riker.replit.dev/',
    accent:    '#8E44AD',
    overview:  'A responsive gallery page showcasing my personal favorite album covers — Pop Smoke, The Weeknd, J. Cole, and more. The challenge was making a grid of images that looked equally great on a phone, tablet, and desktop without writing separate stylesheets.',
    languages: [
      { name: 'HTML5', detail: 'Used <figure> and <figcaption> elements to semantically pair each image with its album and artist name. Learned how to write accessible image alt text and organize content in a grid container.' },
      { name: 'CSS3',  detail: 'Focused heavily on CSS Grid — defining column templates, gap spacing, and auto-fit with minmax() to make the grid automatically adjust as the screen shrinks. Also used media queries to override layouts at specific breakpoints.' },
    ],
    concepts: [
      { name: 'CSS Grid',           detail: 'My first real project using CSS Grid. Learned grid-template-columns, repeat(), auto-fit, and minmax() to build a flexible image gallery without a framework.' },
      { name: 'Responsive Design',  detail: 'Designed mobile-first — starting with a single-column layout and adding columns as the viewport widened. Used @media queries at 480px, 768px, and 1024px.' },
      { name: 'Visual Hierarchy',   detail: 'Made design choices about sizing, spacing, and typography to ensure the album art was the hero of the page, not competing with surrounding text.' },
      { name: 'Image Optimization', detail: 'Learned why image file size matters for load times and how to use width: 100% with aspect-ratio to keep proportional images that fill their containers.' },
    ],
    tools:      ['VS Code', 'Chrome DevTools', 'Google Fonts', 'Replit'],
    learned: [
      'CSS Grid — one of the most powerful layout tools in CSS',
      'The difference between responsive design (fluid) vs. adaptive design (fixed breakpoints)',
      'How @media queries work and when to use them',
      'Mobile-first thinking: design for the smallest screen first, then expand',
      'How consistent spacing (gap) elevates a gallery from messy to professional',
    ],
    challenge:  'Making the grid automatically reflow without setting fixed columns for every breakpoint. Once I discovered auto-fit with minmax(), it clicked — the browser handles the math.',
    reflection: 'This project taught me that great design is mostly about restraint. The album art was the content — my job was to get out of the way and let it breathe.',
  },

  'sea-bright': {
    title:     'Sea Bright',
    year:      'Junior',
    tag:       'Local Entertainment Guide',
    skills:    ['JavaScript', 'DOM Manipulation', 'CSS3', 'Event Listeners'],
    image:     '/seabright.png',
    liveUrl:   'https://alleniverson25.github.io/Summer-tainment-Site/',
    accent:    '#1E8449',
    overview:  'A summer entertainment guide for Sea Bright, New Jersey — complete with aerial drone photography of the beach and boardwalk. This was my first project where JavaScript brought the page to life: interactive sections, dynamic behavior, and real event handling.',
    languages: [
      { name: 'HTML5',      detail: 'Structured the page into distinct sections — hero, restaurants, events, beach guide — using semantic HTML. Built anchor links to let the navbar scroll-jump to each section.' },
      { name: 'CSS3',       detail: 'Used CSS animations and transitions for hover effects on cards and buttons. Learned how to style dynamic classes that JavaScript toggles on and off.' },
      { name: 'JavaScript', detail: 'My first real JavaScript project. Wrote functions, used querySelector and getElementById, attached addEventListener calls, and manipulated the DOM to show/hide content dynamically.' },
    ],
    concepts: [
      { name: 'DOM Manipulation',  detail: 'Used document.querySelector() and document.getElementById() to select elements, then changed their styles, text content, and visibility in response to user actions.' },
      { name: 'Event Listeners',   detail: 'Attached click, mouseover, and scroll events to elements using addEventListener(). Learned the event object and how to use event.target to identify what the user clicked.' },
      { name: 'Functions',         detail: 'Wrote named functions and began to understand function parameters, return values, and calling functions at the right moment (inside event callbacks).' },
      { name: 'Variables & Scope', detail: 'Used const and let to store references to DOM elements and data. Learned why var is problematic and how block-scoping with const/let prevents bugs.' },
    ],
    tools:      ['VS Code', 'GitHub Pages', 'Chrome DevTools', 'DJI Drone Camera'],
    learned: [
      'JavaScript fundamentals — variables, functions, conditionals, and loops',
      'How the DOM (Document Object Model) represents HTML as a tree of objects',
      'Selecting and modifying DOM elements with querySelector and getElementById',
      'Attaching event listeners to make pages respond to user actions',
      'How JavaScript, HTML, and CSS work together as three separate layers of a webpage',
    ],
    challenge:  'Getting the show/hide toggle to work smoothly. My first attempt just set display: none which caused jarring jumps. I then added CSS transitions and toggled a class instead, which made it animate.',
    reflection: 'Sea Bright was where programming "clicked" for me. Once I wrote my first event listener and watched the page actually respond to something I clicked — I was hooked. JavaScript felt like giving the page a brain.',
  },

  'virtual-art-gallery': {
    title:     'Virtual Art Gallery',
    year:      'Junior',
    tag:       'Art & Culture',
    skills:    ['UI/UX Design', 'CSS Animations', 'JavaScript', 'Atmospheric Design'],
    image:     '/virtual_art_gallery.png',
    liveUrl:   'https://alleniverson25.github.io/VirtualGallery/',
    accent:    '#A04000',
    overview:  '"Artistry" — an immersive virtual museum featuring classical paintings with an artist directory and 3D tour section. The goal was to make visitors feel like they were walking through a real gallery: dark walls, warm lighting, slow hover animations, and deliberate typography. This was my most design-focused project to date.',
    languages: [
      { name: 'HTML5',      detail: 'Built with semantic sectioning elements (<main>, <article>, <aside>) and ARIA attributes to ensure the gallery was accessible. Used figure/figcaption pairs for every artwork.' },
      { name: 'CSS3',       detail: 'Heavy use of CSS custom properties (variables) to manage the dark color palette consistently. Used keyframe animations for subtle reveal effects and transition for smooth hover states on painting cards.' },
      { name: 'JavaScript', detail: 'Powered the interactive artist directory — clicking an artist\'s name highlighted their works on the page. Used classList.add/remove and querySelectorAll with forEach to toggle multiple elements at once.' },
    ],
    concepts: [
      { name: 'CSS Custom Properties',   detail: 'Defined --bg-dark, --gold-accent, --text-muted as CSS variables at :root level. Changing one variable instantly updated the entire site\'s palette — a huge step in maintainability.' },
      { name: 'Keyframe Animations',     detail: 'Used @keyframes to create subtle fade-in and translate-up entrance animations for paintings as the page loaded. Learned animation-delay to stagger items.' },
      { name: 'UX Principles',           detail: 'Studied real museum websites for inspiration. Applied principles of visual breathing room (whitespace), consistent color temperature, and hierarchical type sizing to guide the eye.' },
      { name: 'Z-index & Layering',      detail: 'Managed overlapping elements — image overlays, hover cards, and tooltip-style labels — using z-index and position: absolute/relative stacking contexts.' },
      { name: 'CSS Transitions',         detail: 'Used transition: all 0.4s ease on painting cards to smoothly scale and brighten on hover, giving the gallery a polished, gallery-quality feel.' },
    ],
    tools:      ['VS Code', 'GitHub Pages', 'Google Fonts', 'Unsplash', 'Chrome DevTools'],
    learned: [
      'CSS variables — one of the most useful CSS features for managing consistent design systems',
      '@keyframes animations and how to control timing, delay, and iteration',
      'The difference between UI (interface) design and UX (experience) design',
      'How dark backgrounds with warm accents create atmosphere — not just aesthetics',
      'forEach() and querySelectorAll() for batch DOM operations',
    ],
    challenge:  'Making the gallery feel atmospheric without being too dark to read. I spent a lot of time adjusting opacity levels on text against dark backgrounds to hit the right balance between mood and legibility.',
    reflection: 'Artistry pushed me to think beyond "does it work?" to "how does it feel?" That shift — from developer mindset to designer mindset — changed how I approach every project since.',
  },

  'symphony': {
    title:     'Symphony & Harmony',
    year:      'Senior',
    tag:       'Medical / Professional',
    skills:    ['React', 'JSX', 'Component Architecture', 'CSS Transitions'],
    image:     '/symphony.png',
    liveUrl:   'https://alleniverson25.github.io/Symphony-and-Harmony/',
    accent:    '#2E6E88',
    overview:  'A professional website for Dr. Svetlana Friedman, a visceral manipulation specialist based in Marlboro, NJ. Features a calming hero with real medical photography, a smooth "Book a Free Consultation" CTA, and React-powered page transitions throughout. The goal: feel trustworthy, warm, and professional at once.',
    languages: [
      { name: 'JSX',        detail: 'Wrote all UI as JSX — JavaScript that looks like HTML but compiles to React.createElement calls. Learned how JSX differs from HTML (className vs class, camelCase events, self-closing tags for all void elements).' },
      { name: 'JavaScript', detail: 'Used ES6+ features extensively: arrow functions, destructuring, template literals, and the spread operator. State updates and event handlers were written as clean arrow functions.' },
      { name: 'CSS3',       detail: 'Wrote CSS Modules scoped to each component so styles never leaked. Used CSS transitions on route changes to fade between sections smoothly.' },
    ],
    concepts: [
      { name: 'React Components',       detail: 'Split the site into reusable components: <Navbar />, <HeroSection />, <AboutSection />, <ServicesGrid />, <CTAButton />, <Footer />. Each component manages its own JSX and styles.' },
      { name: 'Props & Data Flow',      detail: 'Passed data down from a parent App component via props. Learned how one-way data flow keeps components predictable and easier to debug.' },
      { name: 'useState Hook',          detail: 'Used useState to track whether the mobile menu was open/closed, and to manage form input values on the contact section. Learned the rules of hooks (only call at top level).' },
      { name: 'React Router',           detail: 'Implemented client-side routing with <Route> and <Link> so navigating between sections felt instant with no page reload.' },
      { name: 'CSS Transitions & UX',   detail: 'Wrapped route changes in a fade transition using opacity and a 300ms ease. Small animation details that make professional sites feel polished.' },
    ],
    tools:      ['VS Code', 'React (Create React App)', 'GitHub Pages', 'npm', 'Chrome DevTools'],
    learned: [
      'React\'s component model — thinking in small, reusable pieces instead of one monolithic HTML file',
      'The virtual DOM — how React diffs and updates only what changed',
      'Props for passing data, state for managing local interactivity',
      'React hooks (useState, useEffect) and the rules that govern them',
      'How to deploy a React app to GitHub Pages using the gh-pages npm package',
    ],
    challenge:  'Deploying to GitHub Pages with React Router was tricky — the browser tries to load /about as a real file, which 404s. I solved it using HashRouter (#/) instead of BrowserRouter for the GitHub Pages deployment.',
    reflection: 'Building for a real client (my family) raised the stakes. Every design decision mattered because a real person\'s business depended on it. React gave me the structure to build something I\'d actually be proud to hand off.',
  },

  'top-8-movies': {
    title:     'Top 8 Movies',
    year:      'Senior',
    tag:       'Dynamic Data Gallery',
    skills:    ['Dynamic Data', 'JavaScript ES6', 'JSON', 'Card UI Design'],
    image:     '/top_8_movies.png',
    liveUrl:   'https://alleniverson25.github.io/NJIT-Project-2-Movie-Poster-Gallery/',
    accent:    '#C97850',
    overview:  'A dynamic gallery combining IMDB data with my personal top 8 films — The Shawshank Redemption, The Godfather, Schindler\'s List, and more. Each card shows multiple posters, runtime, IMDB rating, genre tags, and links directly to the IMDB page. The full data is stored as structured JSON and rendered entirely through JavaScript.',
    languages: [
      { name: 'HTML5',      detail: 'The HTML file is almost empty — just a <div id="gallery"></div> container. All content is injected by JavaScript. This was my first time building a "data-driven" page where JS does all the work.' },
      { name: 'CSS3',       detail: 'Designed cinematic movie cards with dark backgrounds, poster image carousels, and a star-rating visual built with Unicode characters styled in CSS. Used CSS Grid for the gallery and Flexbox inside each card.' },
      { name: 'JavaScript', detail: 'Stored all 8 movies as a JSON array of objects, then used .map() to iterate and generate HTML strings, injected via innerHTML. Used .filter() to sort by rating and .sort() to reorder the gallery.' },
    ],
    concepts: [
      { name: 'JSON Data Structures',   detail: 'Defined a movies array where each object had: title, year, director, runtime, rating, genres (array), posters (array of image URLs), and imdbLink. Learned to access nested properties like movie.genres[0].' },
      { name: 'Array Methods',          detail: 'Used .map() to transform data into HTML, .filter() to show only movies above a rating threshold, .sort() to reorder by rating or year, and .forEach() to iterate without returning a value.' },
      { name: 'Template Literals',      detail: 'Used ES6 template literals (backtick strings) to build HTML markup inside JavaScript. Multi-line strings with ${variable} interpolation made generating card HTML readable.' },
      { name: 'Dynamic DOM Injection',  detail: 'Generated the entire gallery HTML as a string using .map().join("") then assigned it to element.innerHTML. Learned the tradeoffs of innerHTML vs. createElement for performance and security.' },
      { name: 'Image Carousels',        detail: 'Each movie card cycled through multiple poster images using JavaScript setInterval — changing the displayed image every 3 seconds to show alternate artwork.' },
    ],
    tools:      ['VS Code', 'GitHub Pages', 'IMDB', 'Chrome DevTools'],
    learned: [
      'Thinking in data structures — designing JSON before writing any HTML',
      'Array methods: .map(), .filter(), .sort(), .forEach(), .find() — the Swiss Army knife of JavaScript',
      'Template literals for readable, multi-line HTML generation in JavaScript',
      'The difference between static sites (HTML written by hand) and data-driven sites (JS generates HTML)',
      'setInterval and clearInterval for timed, repeating actions',
    ],
    challenge:  'The image carousel inside each card conflicted with the gallery layout — setInterval kept all 8 carousels running simultaneously, eating memory. I refactored to pause carousels when they scrolled out of the viewport using the Intersection Observer API.',
    reflection: 'Top 8 Movies was the project where I stopped thinking like an HTML author and started thinking like a programmer. Once the data and the rendering are separate, you can change either one independently — that\'s when software engineering started making sense.',
  },
};

const YEAR_COLORS: Record<string, { bg: string; text: string }> = {
  Sophomore: { bg: '#EBF5FB', text: '#2E86C1' },
  Junior:    { bg: '#E9F7EF', text: '#1E8449' },
  Senior:    { bg: '#FEF9E7', text: '#A04000' },
};

const ALL_SLUGS = Object.keys(PROJECTS);

export default function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const project   = slug ? PROJECTS[slug] : null;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow            = 'auto';
    document.body.style.height              = 'auto';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow            = prev;
      document.body.style.height              = '';
    };
  }, []);

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center"
        style={{ background: 'linear-gradient(160deg,#0B1F2E,#1A4A62,#8B3A22)' }}>
        <Anchor size={48} className="text-[#C97850] mb-4 opacity-60" />
        <h1 className="text-4xl font-serif text-white mb-2">Project Not Found</h1>
        <p className="text-white/50 mb-8">That island doesn't exist on the map.</p>
      </div>
    );
  }

  const yc     = YEAR_COLORS[project.year] || YEAR_COLORS.Senior;
  const others = ALL_SLUGS.filter(s => s !== slug);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg,#0B1F2E 0%,#0D2B45 40%,#0F1E35 100%)',
      overflowY: 'auto',
      fontFamily: 'sans-serif',
    }}>

      {/* Minimal top bar — no back button */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,25,45,0.95)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Anchor style={{ width: 14, height: 14, color: '#C97850' }} />
            <span style={{ fontSize: 10, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase' }}>
              Joseph Friedman · Portfolio
            </span>
          </div>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────── */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '56px 24px 32px' }}>

        {/* badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em',
            padding: '3px 12px', borderRadius: 999, background: yc.bg, color: yc.text }}>
            {project.year}
          </span>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em',
            padding: '3px 12px', borderRadius: 999, border: `1px solid ${project.accent}55`,
            color: project.accent, background: `${project.accent}18` }}>
            {project.tag}
          </span>
        </div>

        {/* title */}
        <h1 style={{ fontSize: 56, fontFamily: 'serif', color: 'white', margin: '0 0 16px', lineHeight: 1.1 }}>
          {project.title}
        </h1>

        {/* overview */}
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, maxWidth: 680, margin: '0 0 28px' }}>
          {project.overview}
        </p>

        {/* visit button */}
        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 28px', borderRadius: 999, fontSize: 13, fontWeight: 700,
            color: 'white', textDecoration: 'none',
            background: `linear-gradient(135deg, ${project.accent}, ${project.accent}aa)`,
            boxShadow: `0 8px 32px ${project.accent}44` }}>
          <ExternalLink style={{ width: 15, height: 15 }} />
          Visit Live Site
        </a>
      </section>

      {/* ── SCREENSHOT ───────────────────────────────── */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 56px' }}>
        <div style={{ borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          border: `1px solid ${project.accent}30` }}>
          {/* browser chrome */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 14px', background: 'rgba(15,30,50,0.98)',
            borderBottom: `1px solid ${project.accent}20` }}>
            <div style={{ display: 'flex', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,95,87,0.7)' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,189,46,0.7)' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(40,201,64,0.7)' }} />
            </div>
            <div style={{ flex: 1, marginLeft: 8, padding: '3px 10px', borderRadius: 6,
              fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.25)',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
              overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {project.liveUrl}
            </div>
          </div>
          {/* screenshot — full height, no clipping */}
          <img src={project.image} alt={`Screenshot of ${project.title}`}
            style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
        </div>
      </section>

      {/* ── LANGUAGES ────────────────────────────────── */}
      <Section accent={project.accent} icon={<Code2 />} label="Languages Used">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
          {project.languages.map(l => (
            <Card key={l.name} accent={project.accent}>
              <Badge text={l.name} accent={project.accent} />
              <p style={{ margin: '10px 0 0', fontSize: 13.5, color: 'rgba(255,255,255,0.62)', lineHeight: 1.7 }}>
                {l.detail}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      {/* ── CONCEPTS ─────────────────────────────────── */}
      <Section accent={project.accent} icon={<Lightbulb />} label="Concepts & Techniques">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
          {project.concepts.map(c => (
            <Card key={c.name} accent={project.accent}>
              <Badge text={c.name} accent={project.accent} />
              <p style={{ margin: '10px 0 0', fontSize: 13.5, color: 'rgba(255,255,255,0.62)', lineHeight: 1.7 }}>
                {c.detail}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      {/* ── WHAT I LEARNED ───────────────────────────── */}
      <Section accent={project.accent} icon={<BookOpen />} label="What I Learned">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {project.learned.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start',
              padding: '14px 18px', borderRadius: 12,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: project.accent,
                minWidth: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: `${project.accent}22`, flexShrink: 0,
                marginTop: 1 }}>{i + 1}</span>
              <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.72)', lineHeight: 1.65 }}>{item}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── TOOLS + CHALLENGE ────────────────────────── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 56px', display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>

        <Card accent={project.accent}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Wrench style={{ width: 15, height: 15, color: project.accent }} />
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.2em', color: project.accent }}>Tools & Environment</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {project.tools.map(t => (
              <span key={t} style={{ padding: '4px 12px', borderRadius: 999, fontSize: 12,
                fontWeight: 600, color: 'rgba(255,255,255,0.7)',
                background: `${project.accent}18`, border: `1px solid ${project.accent}30` }}>
                {t}
              </span>
            ))}
          </div>
        </Card>

        <Card accent={project.accent}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 15 }}>⚡</span>
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.2em', color: project.accent }}>Biggest Challenge</span>
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, fontStyle: 'italic' }}>
            {project.challenge}
          </p>
        </Card>
      </div>

      {/* ── REFLECTION ───────────────────────────────── */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 64px' }}>
        <div style={{ padding: '32px 36px', borderRadius: 20, position: 'relative',
          background: `linear-gradient(135deg, ${project.accent}22, ${project.accent}0a)`,
          border: `1px solid ${project.accent}35` }}>
          <span style={{ position: 'absolute', top: 16, left: 22, fontSize: 48,
            fontFamily: 'serif', color: project.accent, opacity: 0.3, lineHeight: 1 }}>"</span>
          <p style={{ margin: 0, fontSize: 16, color: 'rgba(255,255,255,0.8)',
            lineHeight: 1.8, fontStyle: 'italic', paddingLeft: 16 }}>
            {project.reflection}
          </p>
          <span style={{ position: 'absolute', bottom: 10, right: 22, fontSize: 48,
            fontFamily: 'serif', color: project.accent, opacity: 0.3, lineHeight: 1 }}>"</span>
        </div>
      </section>

      {/* ── MORE PROJECTS ─────────────────────────────── */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: 40 }} />
        <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.25em', color: 'rgba(255,255,255,0.25)', marginBottom: 20 }}>
          More Spotlight Projects
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
          {others.map(otherSlug => {
            const o   = PROJECTS[otherSlug];
            const oyc = YEAR_COLORS[o.year] || YEAR_COLORS.Senior;
            return (
              <Link key={otherSlug} to={`/project/${otherSlug}`}
                style={{ borderRadius: 14, overflow: 'hidden', textDecoration: 'none',
                  display: 'block', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  transition: 'transform 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}>
                <div style={{ aspectRatio: '16/9', overflow: 'hidden' }}>
                  <img src={o.image} alt={o.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover',
                      objectPosition: 'top', filter: 'grayscale(35%)' }} />
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.12em', padding: '2px 8px', borderRadius: 999,
                    background: oyc.bg, color: oyc.text }}>
                    {o.year}
                  </span>
                  <p style={{ margin: '8px 0 0', fontSize: 13, fontFamily: 'serif',
                    color: 'rgba(255,255,255,0.8)', lineHeight: 1.3 }}>
                    {o.title}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '24px', background: 'rgba(0,0,0,0.25)', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 10, textTransform: 'uppercase',
          letterSpacing: '0.25em', color: 'rgba(255,255,255,0.2)' }}>
          Joseph Friedman · Marlboro HS · Class of 2026
        </p>
      </footer>
    </div>
  );
}

/* ── Small helper components ─────────────────────────────── */

function Section({ accent, icon, label, children }: { accent: string; icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 48px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
        <span style={{ color: accent, display: 'flex', alignItems: 'center' }}>
          {React.cloneElement(icon as React.ReactElement, { style: { width: 17, height: 17 } })}
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.22em', color: accent }}>
          {label}
        </span>
        <div style={{ flex: 1, height: 1, background: `${accent}22` }} />
      </div>
      {children}
    </section>
  );
}

function Card({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '18px 20px', borderRadius: 14,
      background: 'rgba(255,255,255,0.03)', border: `1px solid ${accent}22` }}>
      {children}
    </div>
  );
}

function Badge({ text, accent }: { text: string; accent: string }) {
  return (
    <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.12em',
      padding: '3px 10px', borderRadius: 999,
      background: `${accent}25`, color: accent,
      border: `1px solid ${accent}44` }}>
      {text}
    </span>
  );
}
