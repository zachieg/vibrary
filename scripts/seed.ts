import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const seedProjects = [
  {
    title: "Budget Tracker",
    tagline: "A personal expense tracker built entirely by vibing with Claude",
    description: `A clean, responsive budget tracking app that helps you stay on top of your finances without the complexity of traditional tools.

## Features
- Add income and expense transactions with categories
- Monthly summary dashboard with charts
- Category breakdown and spending trends
- Export to CSV

## How it was built
This was a weekend project built entirely through conversation with Claude. Started with a simple prompt: "Help me build a budget tracker" and iterated from there. The entire app was vibecoded in about 4 hours.`,
    demo_url: null,
    screenshot_url: null,
    tags: ["web-app", "finance", "react"],
    ai_tool_used: "Claude",
    submitter_name: "Vibrary Team",
    submitter_email: "hello@vibrary.dev",
    featured: true,
  },
  {
    title: "Markdown Note App",
    tagline: "A minimal note-taking app with live markdown preview",
    description: `A fast, distraction-free note-taking app with real-time markdown rendering. Everything lives in your browser's local storage—no accounts, no cloud sync, no distractions.

## Features
- Split-pane editor with live preview
- Full markdown support including code blocks and tables
- Dark mode toggle
- Keyboard shortcuts for common formatting
- Local storage persistence

## Tech Stack
Built with Next.js and Tailwind CSS. The markdown rendering uses react-markdown with syntax highlighting via rehype-highlight.`,
    demo_url: null,
    screenshot_url: null,
    tags: ["web-app", "productivity", "nextjs"],
    ai_tool_used: "Cursor",
    submitter_name: "Vibrary Team",
    submitter_email: "hello@vibrary.dev",
    featured: true,
  },
  {
    title: "Pomodoro Timer",
    tagline: "A beautiful pomodoro timer with ambient sounds",
    description: `Stay focused with this beautifully designed Pomodoro timer. Features ambient background sounds (rain, cafe, forest) to help you get into flow state.

## Features
- Classic 25/5 minute work/break cycles
- Long break after 4 sessions
- Ambient sound mixer with adjustable volumes
- Session history and statistics
- Desktop notifications

The entire UI was designed through conversation with Claude, aiming for a calm, minimal aesthetic that doesn't distract from the work.`,
    demo_url: null,
    screenshot_url: null,
    tags: ["web-app", "productivity"],
    ai_tool_used: "Claude",
    submitter_name: "Vibrary Team",
    submitter_email: "hello@vibrary.dev",
    featured: true,
  },
  {
    title: "Color Palette Generator",
    tagline: "Generate harmonious color palettes from a single color",
    description: `Pick any color and instantly generate complementary, analogous, triadic, and split-complementary palettes. Export to CSS variables, Tailwind config, or copy hex values.

## Features
- Real-time palette generation from any base color
- Multiple harmony modes (complementary, analogous, triadic, etc.)
- Accessibility contrast checker for each color pair
- One-click copy for hex, RGB, and HSL values
- Export to CSS custom properties or Tailwind config

A handy tool for designers and developers who need quick color inspiration.`,
    demo_url: null,
    screenshot_url: null,
    tags: ["web-app", "creative", "react", "developer-tools"],
    ai_tool_used: "GPT-4",
    submitter_name: "Vibrary Team",
    submitter_email: "hello@vibrary.dev",
    featured: false,
  },
  {
    title: "Recipe Search Engine",
    tagline: "Search recipes by ingredients you have on hand",
    description: `Tired of searching "chicken broccoli rice recipe" only to find results that need 20 other ingredients? This app lets you enter what you actually have in your fridge and finds recipes that match.

## How it works
1. Enter the ingredients you have
2. The app searches a database of 10,000+ recipes
3. Results are ranked by how many of your ingredients they use
4. Each result shows what you're missing (if anything)

Built with Next.js API routes and a Supabase full-text search index.`,
    demo_url: null,
    screenshot_url: null,
    tags: ["web-app", "api", "nextjs"],
    ai_tool_used: "Claude",
    submitter_name: "Vibrary Team",
    submitter_email: "hello@vibrary.dev",
    featured: false,
  },
  {
    title: "Snake Game Remix",
    tagline: "The classic snake game with power-ups and neon visuals",
    description: `A vibecoded remake of the classic Snake game with modern visuals and gameplay twists.

## Features
- Neon-glow aesthetic with particle effects
- Power-ups: speed boost, slow-mo, double points, ghost mode
- Increasing difficulty levels
- Local high score leaderboard
- Mobile-friendly touch controls

The game logic and rendering were built entirely through prompting GPT-4o. The neon visual style was achieved with CSS filters and canvas glow effects.`,
    demo_url: null,
    screenshot_url: null,
    tags: ["game", "entertainment", "react"],
    ai_tool_used: "GPT-4o",
    submitter_name: "Vibrary Team",
    submitter_email: "hello@vibrary.dev",
    featured: true,
  },
  {
    title: "Git Commit Analyzer",
    tagline: "CLI tool that analyzes your git history and generates insights",
    description: `A command-line tool that reads your git log and generates meaningful insights about your development patterns.

## What it shows
- Commit frequency by day/week/month
- Most active files and directories
- Average commit message length and quality score
- Peak coding hours
- Language breakdown based on file extensions

## Usage
\`\`\`bash
npx git-commit-analyzer --repo ./my-project --days 90
\`\`\`

Built with Node.js and the simple-git library. Output is formatted with chalk for beautiful terminal rendering.`,
    demo_url: null,
    screenshot_url: null,
    tags: ["cli-tool", "developer-tools", "node"],
    ai_tool_used: "Claude",
    submitter_name: "Vibrary Team",
    submitter_email: "hello@vibrary.dev",
    featured: false,
  },
  {
    title: "Habit Tracker Dashboard",
    tagline: "Track daily habits with a GitHub-style contribution graph",
    description: `A visual habit tracking dashboard inspired by GitHub's contribution graph. See your streaks, track multiple habits, and stay motivated with visual progress.

## Features
- Add unlimited custom habits
- GitHub-style heat map for each habit
- Current streak and longest streak tracking
- Weekly completion rate
- Data stored in localStorage (no account needed)

Built with React and Recharts. The contribution graph component was entirely vibecoded through iterative prompting.`,
    demo_url: null,
    screenshot_url: null,
    tags: ["web-app", "health", "react"],
    ai_tool_used: "Cursor",
    submitter_name: "Vibrary Team",
    submitter_email: "hello@vibrary.dev",
    featured: false,
  },
  {
    title: "API Mock Server",
    tagline: "Spin up a mock REST API in seconds with a JSON config",
    description: `Need a quick API for prototyping? Define your endpoints in a JSON file and this tool spins up a fully functional REST API with CRUD operations, pagination, filtering, and realistic latency simulation.

## Features
- Define resources in a simple JSON schema
- Auto-generates CRUD endpoints
- Configurable response delay for realistic testing
- Supports relationships between resources
- Hot-reload when config changes

## Quick Start
\`\`\`json
{
  "resources": {
    "users": { "fields": ["name", "email", "role"] },
    "posts": { "fields": ["title", "body", "author_id"] }
  }
}
\`\`\`

\`\`\`bash
npx api-mock-server --config ./api.json --port 3001
\`\`\``,
    demo_url: null,
    screenshot_url: null,
    tags: ["api", "developer-tools", "node"],
    ai_tool_used: "GPT-4",
    submitter_name: "Vibrary Team",
    submitter_email: "hello@vibrary.dev",
    featured: false,
  },
  {
    title: "Flashcard Study App",
    tagline: "Spaced repetition flashcards with a clean, focused UI",
    description: `A flashcard app implementing the SM-2 spaced repetition algorithm. Create decks, study cards, and let the algorithm optimize your review schedule for maximum retention.

## Features
- Create and organize flashcards into decks
- SM-2 spaced repetition scheduling
- Markdown support for card content
- Study statistics and progress tracking
- Import/export decks as JSON

A weekend vibecoding project that turned out surprisingly useful for actual studying.`,
    demo_url: null,
    screenshot_url: null,
    tags: ["web-app", "education", "react"],
    ai_tool_used: "Claude",
    submitter_name: "Vibrary Team",
    submitter_email: "hello@vibrary.dev",
    featured: false,
  },
  {
    title: "Startup Landing Page Kit",
    tagline: "A collection of beautiful landing page sections you can mix and match",
    description: `Stop building landing pages from scratch. This kit includes 15+ pre-built sections that you can combine to create a polished startup landing page in minutes.

## Included Sections
- Hero (3 variants)
- Features grid
- Pricing table (3 tiers)
- Testimonials carousel
- FAQ accordion
- Newsletter signup
- Footer (2 variants)
- Stats/metrics bar
- CTA banner

All built with React and Tailwind CSS. Fully responsive and accessible.`,
    demo_url: null,
    screenshot_url: null,
    tags: ["component", "landing-page", "react", "tailwind"],
    ai_tool_used: "v0",
    submitter_name: "Vibrary Team",
    submitter_email: "hello@vibrary.dev",
    featured: true,
  },
  {
    title: "Weather Mood Board",
    tagline: "A beautiful weather dashboard that changes aesthetic based on conditions",
    description: `Not your typical weather app. This dashboard transforms its entire visual design based on the current weather—sunny days get warm gradients and light typography, rainy days get cool tones and moody imagery.

## Features
- Location-based weather using OpenWeatherMap API
- Dynamic backgrounds and color schemes
- 5-day forecast with hourly breakdown
- Animated weather icons
- "What to wear" recommendations

The visual design system was generated entirely through AI conversation, creating a unique aesthetic for each weather condition.`,
    demo_url: null,
    screenshot_url: null,
    tags: ["web-app", "creative", "nextjs"],
    ai_tool_used: "Claude",
    submitter_name: "Vibrary Team",
    submitter_email: "hello@vibrary.dev",
    featured: false,
  },
  {
    title: "Regex Playground",
    tagline: "Test and debug regular expressions with instant visual feedback",
    description: `A developer tool for building and testing regular expressions. Paste your text, write your regex, and see matches highlighted in real-time with capture group breakdowns.

## Features
- Real-time regex matching with highlighting
- Capture group visualization
- Common regex pattern library
- Regex explanation in plain English
- Share regex via URL

Built as a single-page React app. No server needed—everything runs in the browser.`,
    demo_url: null,
    screenshot_url: null,
    tags: ["developer-tools", "web-app", "react"],
    ai_tool_used: "Copilot",
    submitter_name: "Vibrary Team",
    submitter_email: "hello@vibrary.dev",
    featured: false,
  },
  {
    title: "Expense Splitter",
    tagline: "Split group expenses fairly and track who owes whom",
    description: `Going on a trip with friends? This app tracks shared expenses and calculates the minimum number of transactions needed to settle up.

## Features
- Create groups and add members
- Log expenses with flexible splitting (equal, percentage, exact amounts)
- Optimized settlement calculation
- Expense timeline and per-person breakdown
- Share group via link (no accounts needed)

The settlement algorithm was one of the trickiest parts—Claude nailed it on the second attempt.`,
    demo_url: null,
    screenshot_url: null,
    tags: ["web-app", "finance", "react"],
    ai_tool_used: "Claude",
    submitter_name: "Vibrary Team",
    submitter_email: "hello@vibrary.dev",
    featured: false,
  },
  {
    title: "Terminal Portfolio",
    tagline: "A developer portfolio that looks and feels like a terminal",
    description: `A unique portfolio website styled as a terminal emulator. Visitors can type commands to navigate your projects, read your bio, and find your contact info.

## Available Commands
- \`about\` - Short bio
- \`projects\` - List of projects
- \`skills\` - Tech stack
- \`contact\` - Email and social links
- \`resume\` - Download resume
- \`theme\` - Switch color schemes

Built with React and xterm.js. Fully customizable via a JSON config file.`,
    demo_url: null,
    screenshot_url: null,
    tags: ["landing-page", "creative", "react"],
    ai_tool_used: "Windsurf",
    submitter_name: "Vibrary Team",
    submitter_email: "hello@vibrary.dev",
    featured: false,
  },
  {
    title: "Kanban Board",
    tagline: "A drag-and-drop kanban board with real-time collaboration",
    description: `A lightweight kanban board for managing tasks. Drag cards between columns, add labels, set due dates, and collaborate with your team in real-time.

## Features
- Drag-and-drop cards between columns
- Custom columns and labels
- Due date tracking with overdue alerts
- Real-time sync via Supabase Realtime
- Keyboard shortcuts for power users

Built with React, dnd-kit for drag-and-drop, and Supabase for persistence and real-time updates.`,
    demo_url: null,
    screenshot_url: null,
    tags: ["web-app", "productivity", "react", "supabase"],
    ai_tool_used: "Cursor",
    submitter_name: "Vibrary Team",
    submitter_email: "hello@vibrary.dev",
    featured: true,
  },
  {
    title: "Pixel Art Editor",
    tagline: "Create pixel art in your browser with layers and animation support",
    description: `A full-featured pixel art editor that runs entirely in the browser. Create sprites, tile maps, and simple animations—perfect for indie game devs.

## Features
- Configurable canvas size (8x8 to 128x128)
- Layer system with opacity controls
- Animation frames and onion skinning
- Custom color palettes
- Export to PNG, GIF, or sprite sheet

The canvas rendering and layer system were the most complex parts to vibecode. Took about 3 sessions to get right.`,
    demo_url: null,
    screenshot_url: null,
    tags: ["web-app", "creative", "game"],
    ai_tool_used: "Claude",
    submitter_name: "Vibrary Team",
    submitter_email: "hello@vibrary.dev",
    featured: false,
  },
  {
    title: "URL Shortener",
    tagline: "A self-hosted URL shortener with analytics",
    description: `A simple but powerful URL shortener with built-in analytics. Track clicks, referrers, and geographic data for every shortened link.

## Features
- Custom short codes or auto-generated
- Click tracking with timestamps
- Referrer and geographic analytics
- QR code generation for each link
- API for programmatic URL shortening

Built with Next.js API routes and Supabase. The analytics dashboard uses Recharts for visualization.`,
    demo_url: null,
    screenshot_url: null,
    tags: ["web-app", "api", "nextjs", "supabase"],
    ai_tool_used: "Bolt",
    submitter_name: "Vibrary Team",
    submitter_email: "hello@vibrary.dev",
    featured: false,
  },
  {
    title: "Chat Room",
    tagline: "Anonymous real-time chat rooms with emoji reactions",
    description: `Create a chat room, share the link, and start chatting. No sign-up required. Messages are ephemeral—rooms are auto-deleted after 24 hours of inactivity.

## Features
- Instant room creation with shareable links
- Real-time messaging via WebSocket
- Emoji reactions on messages
- Typing indicators
- Auto-delete after inactivity
- Optional room passwords

Built with Next.js and Supabase Realtime for the WebSocket layer.`,
    demo_url: null,
    screenshot_url: null,
    tags: ["web-app", "social", "nextjs", "supabase"],
    ai_tool_used: "Replit AI",
    submitter_name: "Vibrary Team",
    submitter_email: "hello@vibrary.dev",
    featured: false,
  },
  {
    title: "Invoice Generator",
    tagline: "Create professional invoices and export to PDF in seconds",
    description: `A fast, free invoice generator for freelancers. Fill in your details, add line items, and download a beautifully formatted PDF.

## Features
- Professional invoice template
- Add unlimited line items
- Automatic tax and total calculation
- Currency selection (USD, EUR, GBP, etc.)
- PDF export with your logo
- Save drafts in localStorage

No account needed. Your data never leaves your browser (except the PDF you download).`,
    demo_url: null,
    screenshot_url: null,
    tags: ["web-app", "finance", "react"],
    ai_tool_used: "GPT-4o",
    submitter_name: "Vibrary Team",
    submitter_email: "hello@vibrary.dev",
    featured: false,
  },
  {
    title: "Music Visualizer",
    tagline: "Feed it any audio and watch mesmerizing visualizations",
    description: `Drop an audio file or paste a URL and watch the music come alive with real-time frequency visualizations. Multiple visual modes from simple waveforms to complex particle systems.

## Visual Modes
- Classic waveform
- Frequency bars
- Circular spectrum
- Particle flow
- 3D terrain

Built with the Web Audio API for frequency analysis and Three.js for 3D rendering.`,
    demo_url: null,
    screenshot_url: null,
    tags: ["web-app", "entertainment", "creative"],
    ai_tool_used: "Claude",
    submitter_name: "Vibrary Team",
    submitter_email: "hello@vibrary.dev",
    featured: false,
  },
  {
    title: "Code Screenshot Tool",
    tagline: "Turn code snippets into beautiful shareable images",
    description: `Paste your code, customize the theme and styling, and export a beautiful screenshot. Perfect for sharing code on social media and presentations.

## Features
- 20+ syntax highlighting themes
- Custom background colors and gradients
- Window chrome styling (macOS, VS Code, minimal)
- Adjustable padding and font size
- Export as PNG or SVG
- Share via URL

Inspired by Carbon and Ray.so, but vibecoded from scratch in an afternoon.`,
    demo_url: null,
    screenshot_url: null,
    tags: ["developer-tools", "creative", "react"],
    ai_tool_used: "Cursor",
    submitter_name: "Vibrary Team",
    submitter_email: "hello@vibrary.dev",
    featured: false,
  },
  {
    title: "Workout Log",
    tagline: "Simple workout tracking with exercise history and personal records",
    description: `A no-frills workout logger for tracking your lifts. Log exercises, track sets and reps, and watch your personal records improve over time.

## Features
- Pre-loaded exercise database (200+ exercises)
- Log sets, reps, and weight
- Personal record tracking and notifications
- Workout templates for quick logging
- Progress charts per exercise
- Export data as CSV

Built with Svelte and localStorage. Offline-first—works without internet.`,
    demo_url: null,
    screenshot_url: null,
    tags: ["web-app", "health", "svelte"],
    ai_tool_used: "Claude",
    submitter_name: "Vibrary Team",
    submitter_email: "hello@vibrary.dev",
    featured: false,
  },
  {
    title: "Typing Speed Test",
    tagline: "Test your typing speed with beautiful real-time feedback",
    description: `A polished typing test app that measures your WPM and accuracy with real-time character-by-character feedback.

## Features
- Multiple test durations (15s, 30s, 60s, 120s)
- Real-time WPM and accuracy tracking
- Character-by-character feedback (correct/incorrect/untyped)
- Historical results graph
- Custom text support
- Multiple language options

The typing input handling was surprisingly complex to vibecode correctly—handling backspace, cursor position, and real-time stats all at once.`,
    demo_url: null,
    screenshot_url: null,
    tags: ["web-app", "education", "react"],
    ai_tool_used: "Gemini",
    submitter_name: "Vibrary Team",
    submitter_email: "hello@vibrary.dev",
    featured: false,
  },
  {
    title: "Chrome Tab Manager",
    tagline: "A Chrome extension to organize, search, and manage your tabs",
    description: `Tame your tab chaos. This Chrome extension gives you a searchable, sortable overview of all your open tabs with one-click organization.

## Features
- Search across all open tabs
- Group tabs by domain
- Suspend inactive tabs to save memory
- Quick-switch between tabs with keyboard shortcuts
- Save tab sessions for later
- Duplicate tab detection

Built as a Chrome Manifest V3 extension with a React popup UI.`,
    demo_url: null,
    screenshot_url: null,
    tags: ["chrome-extension", "productivity", "react"],
    ai_tool_used: "Lovable",
    submitter_name: "Vibrary Team",
    submitter_email: "hello@vibrary.dev",
    featured: false,
  },
  {
    title: "Stock Watchlist",
    tagline: "A minimal stock watchlist with real-time price updates",
    description: `Keep an eye on your investments with this clean, fast stock watchlist. Add tickers, see real-time prices, and track daily changes at a glance.

## Features
- Search and add any US stock ticker
- Real-time price updates via Finnhub API
- Daily change percentage with color coding
- Sparkline mini-charts for 7-day trend
- Portfolio value estimation
- Responsive design for desktop and mobile

Built with Next.js and the Finnhub free API tier. Data refreshes every 15 seconds.`,
    demo_url: null,
    screenshot_url: null,
    tags: ["web-app", "finance", "nextjs"],
    ai_tool_used: "Claude",
    submitter_name: "Vibrary Team",
    submitter_email: "hello@vibrary.dev",
    featured: false,
  },
  {
    title: "Meme Generator",
    tagline: "Create and share memes with custom text and templates",
    description: `The classic meme generator, vibecoded. Pick a template, add your text, customize the font and positioning, and download or share your creation.

## Features
- 50+ popular meme templates
- Custom image upload
- Draggable text positioning
- Font customization (size, color, stroke)
- Download as PNG
- Gallery of community creations

The drag-and-drop text positioning on the canvas was the most fun part to build through conversation with the AI.`,
    demo_url: null,
    screenshot_url: null,
    tags: ["web-app", "entertainment", "creative"],
    ai_tool_used: "GPT-4",
    submitter_name: "Vibrary Team",
    submitter_email: "hello@vibrary.dev",
    featured: false,
  },
  {
    title: "Email Template Builder",
    tagline: "Drag-and-drop email template builder with HTML export",
    description: `Build responsive HTML email templates without writing code. Drag components, customize styles, and export clean HTML that works across all email clients.

## Components
- Header/Footer
- Text blocks with rich formatting
- Image blocks with alt text
- Button/CTA
- Dividers and spacers
- Social media icons
- Two-column layouts

## Export Options
- Raw HTML
- Copy to clipboard
- Send test email

The HTML email compatibility layer was the hardest part—so many email client quirks to handle.`,
    demo_url: null,
    screenshot_url: null,
    tags: ["web-app", "developer-tools", "react"],
    ai_tool_used: "Windsurf",
    submitter_name: "Vibrary Team",
    submitter_email: "hello@vibrary.dev",
    featured: false,
  },
];

async function seed() {
  console.log(`Seeding ${seedProjects.length} projects...`);

  for (const project of seedProjects) {
    const slug = generateSlug(project.title);

    // Check if slug already exists
    const { data: existing } = await supabase
      .from("projects")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      console.log(`  Skipping "${project.title}" (slug "${slug}" already exists)`);
      continue;
    }

    const { error } = await supabase.from("projects").insert({
      ...project,
      slug,
      status: "published",
      demo_url: project.demo_url ?? null,
      screenshot_url: project.screenshot_url ?? null,
    });

    if (error) {
      console.error(`  Failed to insert "${project.title}":`, error.message);
    } else {
      console.log(`  Inserted "${project.title}" (slug: ${slug})${project.featured ? " [FEATURED]" : ""}`);
    }
  }

  console.log("Done!");
}

seed().catch(console.error);
