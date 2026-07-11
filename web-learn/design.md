AI Engineering from Scratch — Design Science
URL: https://aiengineeringfromscratch.com/index.html
Version: Curriculum v1.0 · 2026
License: MIT / Open Source
Maintained by: Rohit Ghumare & contributors
Playground Module: K8 Terminal UI & TUI Integration
1. Design Philosophy
"Engineering Manual Aesthetic × Terminal Playground"
The site is designed to feel like a printed technical manual that unfolds into an interactive terminal playground. Every decision serves readability, structural clarity, and hands-on learning:
Paper-first base: Dot-grid background, drop-caps, justified columns, and serif body text evoke printed matter.
Terminal playground: Code mockups live inside macOS-style terminal windows; command outputs render in TUI-style bordered panels.
Brutalist-technical: Hard shadows, 1px borders, monospace labels, uppercase display type, and zero border-radius create an engineering-document feel.
Blueprint accent: A single electric-blue (#3553ff) acts as the primary accent against warm paper tones; cyan/teal (#00d4aa) and gold (#f0c040) augment for terminal syntax.
No gradients, no blur (except header): Flat colors, sharp edges, solid rules — except for the subtle page background dot-grid.
2. Design Tokens
2.1 Color Palette
Light Theme (Default)
segment.table
Token	Hex / Value	Usage
--bg	#fafaf5	Page background (warm off-white)
--bg-surface	#f3f1e8	Elevated surfaces, buttons
--bg-surface-hover	#ece9dc	Hover states for surfaces
--ink	#1a1a1a	Primary text, borders
--ink-soft	#4a4a4a	Secondary text
--ink-mute	#7a7a78	Tertiary / disabled text
--rule	#1a1a1a	Hard borders
--rule-soft	rgba(26, 26, 26, 0.16)	Dividers, subtle borders
--paper-rule	rgba(26, 26, 26, 0.08)	Dot-grid background
--blueprint	#3553ff	Primary accent, links, headings
--blueprint-tint	rgba(53, 83, 255, 0.08)	Soft hover backgrounds
--blueprint-tint-strong	rgba(53, 83, 255, 0.18)	Selection highlights
--status-complete	#3553ff	Completed lesson indicator
--status-in-progress	#4a4a4a	In-progress indicator
--status-planned	#b8b6ad	Planned / future indicator
--warn	#b8870f	Capstone / warning labels
--code-bg	#efece0	Inline code background
--modal-bg	#fafaf5	Modal / command palette bg
--overlay-bg	rgba(26, 26, 26, 0.55)	Backdrop overlay
--header-bg	rgba(250, 250, 245, 0.94)	Fixed header with blur
--terminal-bg	#0d1117	Terminal window background
--terminal-text	#e6edf3	Terminal primary text
--terminal-green	#3fb950	Terminal success / OK
--terminal-cyan	#00d4aa	Terminal labels / K8 resources
--terminal-yellow	#f0c040	Terminal warnings / highlights
--terminal-red	#ff5f56	Terminal errors / macOS close
--terminal-mute	#7d8590	Terminal secondary text
--terminal-border	#30363d	Terminal inner borders
--tui-bg	#161616	TUI panel background
--tui-border	#3d3d3d	TUI box borders
--tui-text	#e8e6dc	TUI primary text
--tui-cyan	#56b6c2	TUI labels (File:, Size:)
--tui-gold	#e5c07b	TUI emphasized text
--tui-green	#98c379	TUI success / paths
--tui-magenta	#c678dd	TUI keys / shortcuts
Dark Theme ([data-theme="dark"])
segment.table
Token	Hex / Value	Usage
--bg	#0a0d1a	Deep navy-black background
--bg-surface	#131830	Elevated surfaces
--bg-surface-hover	#1b2244	Hover states
--ink	#e8e6dc	Primary text (warm white)
--ink-soft	#a8a6a0	Secondary text
--ink-mute	#7a7878	Muted text
--rule	#e8e6dc	Hard borders
--rule-soft	rgba(232, 230, 220, 0.18)	Dividers
--paper-rule	rgba(232, 230, 220, 0.08)	Dot-grid
--blueprint	#6b8eff	Lighter electric blue for dark mode
--blueprint-tint	rgba(107, 142, 255, 0.12)	Soft hover
--blueprint-tint-strong	rgba(107, 142, 255, 0.22)	Strong highlight
--status-complete	#6b8eff	Complete indicator
--status-in-progress	#c8c6c0	In-progress
--status-planned	#4a4a48	Planned
--warn	#d4a83d	Warning / capstone
--code-bg	#131830	Code background
--modal-bg	#0f1424	Modal background
--overlay-bg	rgba(10, 13, 26, 0.78)	Dark overlay
--header-bg	rgba(10, 13, 26, 0.94)	Header blur bg
--terminal-bg	#0a0d1a	Terminal window (same as page bg)
--terminal-text	#e8e6dc	Terminal text
--terminal-green	#7ee787	Brighter green for dark
--terminal-cyan	#56d4dd	Brighter cyan for dark
--terminal-yellow	#f0c040	Yellow stays
--terminal-red	#ff7b72	Brighter red for dark
--terminal-mute	#8b949e	Muted text
--terminal-border	#30363d	Terminal borders
--tui-bg	#0f1424	TUI panel (same as modal)
--tui-border	#30363d	TUI borders
--tui-text	#e8e6dc	TUI text
--tui-cyan	#56b6c2	TUI labels
--tui-gold	#e5c07b	TUI emphasis
--tui-green	#98c379	TUI paths
--tui-magenta	#c678dd	TUI keys
2.2 Typography
segment.table
Role	Font Stack	Weight	Usage
Display	'VT323', ui-monospace, 'JetBrains Mono', monospace	400	H1–H4, logo, drop-caps, stat numbers, TUI titles
Body	'Source Serif 4', 'Source Serif Pro', 'Iowan Old Style', Georgia, serif	400–700	Paragraphs, descriptions, modal body
Mono	'JetBrains Mono', ui-monospace, 'Consolas', monospace	400–700	Labels, buttons, nav, code, stats, terminal text
Terminal	'JetBrains Mono', 'SF Mono', 'Fira Code', monospace	400–700	Terminal windows, command output, K8 YAML
TUI	'VT323', 'Courier New', monospace	400	TUI panels, pixel-art style headers, retro UI
Type Scale (Fluid):
h1: clamp(2.4rem, 6vw, 4.4rem) — Section titles
h2: clamp(1.8rem, 4vw, 2.6rem) — Sub-sections
h3: clamp(1.2rem, 2.6vw, 1.6rem) — Card titles
h4: 1.1rem — Small headings
Body: 1rem (18px base), line-height 1.62
Label / Eyebrow: 0.72rem, letter-spacing 0.12em–0.16em, uppercase
Masthead Title: clamp(3.2rem, 11vw, 8rem), line-height 0.86, uppercase
Terminal: 0.85rem (13.6px), line-height 1.5, no anti-aliasing override
TUI: 0.9rem (14.4px), line-height 1.4, uppercase for headers
2.3 Spacing & Layout
Container: max-width: 1200px (1240px on ≥1440px), centered, padding 0 32px
Section Padding: 80px 0 (vertical only)
Header Height: 64px (56px mobile)
Header Offset: 92px (for scroll-padding)
Grid Gap: 48px (preface), 16px (general)
Border Radius: 0px (everything is square-cornered) — except terminal window chrome: 8px 8px 0 0
Terminal Window Padding: 16px 20px (content area)
TUI Panel Padding: 12px 16px
TUI Box Border: 1px solid var(--tui-border) or 2px solid var(--tui-border) for emphasis
2.4 Shadows
segment.table
Name	Value	Usage
--shadow-hard	3px 3px 0 var(--ink)	Buttons, small cards
--shadow-hard-lg	5px 5px 0 var(--ink)	Large cards, modals
--shadow-terminal	0 8px 32px rgba(0,0,0,0.24)	Terminal window float
--shadow-tui	0 0 0 1px var(--tui-border), 0 4px 16px rgba(0,0,0,0.4)	TUI panels
Command Palette	6px 6px 0 var(--ink)	Search panel
3. Global Patterns
3.1 Background Texture
The entire page uses a fixed dot-grid:
css
background-image: radial-gradient(var(--paper-rule) 1px, transparent 1px);
background-size: 16px 16px;
background-attachment: fixed;
3.2 ASCII Rule Divider
A custom 6px-high decorative rule using two repeating linear gradients:
Top 3px: dashed blueprint line (4px on, 4px off)
Bottom 3px: dashed tint line (8px on, 6px off)
Reveals via clip-path: inset(0 100% 0 0) → inset(0 0 0 0) on scroll
3.3 Drop Cap
First paragraph of preface sections gets a floated 4.2rem VT323 character in blueprint color.
3.4 Selection
css
::selection {
  background: var(--blueprint);
  color: var(--bg);
}
4. Components
4.1 Site Header
Position: Fixed, z-index: 100
Background: var(--header-bg) + backdrop-filter: blur(10px)
Border: 1px solid var(--rule-soft) bottom
Height: 64px desktop, 56px tablet, 56px mobile
Layout: Flex, space-between, align-center
Logo:
Font: VT323, 1.6rem (scales down to 1rem on mobile)
Text: "AI Engineering from Scratch" (truncated on small screens)
Icon: 12px × 12px solid blueprint square
Hover: color shifts to blueprint
Navigation:
Links: Mono, 0.8rem, uppercase, letter-spacing 0.08em
Color: --ink-soft → --blueprint on hover
Hidden on mobile (except GitHub button)
GitHub Button:
Inline-flex, border 1px solid var(--rule-soft), bg --bg-surface
Mono text, uppercase, star icon + count
Hover: border and text turn blueprint
Theme Toggle:
36px × 36px square button, border 1px solid var(--rule-soft)
Icon swaps between light/dark modes
Hover: border and icon turn blueprint
Search Toggle:
Same dimensions as theme toggle
Opens Command Palette (Cmd/Ctrl+K)
4.2 Buttons
Base Button (.btn):
Font: Mono, 0.8rem, weight 500, uppercase, letter-spacing 0.12em
Padding: 10px 20px
Border: 1px solid var(--ink)
Background: var(--bg)
Hover: bg inverts to ink, text to bg
No border-radius
Primary (.btn-primary):
Background: --blueprint
Border: --blueprint
Text: --bg
Hover: --accent-hover (#2840d6 light, #8aa5ff dark)
Secondary (.btn-secondary):
Transparent bg, ink border
Hover: inverts to ink bg
Masthead Buttons (.masthead-btn):
Smaller: 9px 14px, 0.82rem
Inline-flex with gap
Has a .masthead-btn-count with left border divider
Primary variant uses blueprint border/text
4.3 Modal / Phase Drawer
Overlay: Fixed, z-index: 200, --overlay-bg, fade in 0.2s
Panel: max-width: 760px, max-height: 86vh, border 1px solid var(--ink)
Padding: 36px 32px 28px
Entry: translateY(16px) → 0, 0.25s ease
Modal Header:
Phase number: Mono, 0.78rem, blueprint, uppercase
Title: VT323, 1.8rem, uppercase
Description: Serif, 0.95rem, --ink-soft
Progress Badge:
Inline-flex, border 1px solid var(--blueprint), bg --blueprint-tint
Mono text, uppercase, count + percentage pill
Progress Bar:
4px height, --rule-soft track, --blueprint fill
Fill animates width 0.4s ease
Lesson Row (.modal-lesson):
Grid: 14px minmax(0,1fr) auto auto auto auto
Columns: status dot | title | language | type | read btn | toggle
Status dot: 12px square, border 1px solid
complete: solid blueprint
in-progress: diagonal split blueprint/transparent
planned: dashed border, --ink-mute
Type badge: Mono, 0.62rem, uppercase, bordered
Build: blueprint
Learn: ink
Capstone: warn (#b8870f)
Read button: Mono, 0.72rem, uppercase, bordered, hover turns blueprint
Toggle: 22px square, +/- icon, turns blueprint when done
Modal Footer:
Flex, space-between
Note: Mono, 0.7rem, --ink-mute
Reset button: bordered, hover turns blueprint
4.4 Command Palette (.cp-*)
Trigger: Fixed position, z-index: 1000
Padding top: clamp(68px, 13vh, 150px) to clear header
Backdrop: --overlay-bg, fade 0.15s
Panel: max-width: 640px, max-height: 70vh, border 2px solid var(--ink), shadow 6px 6px 0 var(--ink)
Search Row:
Flex, gap 10px, padding 14px 16px
Icon + Input + ESC kbd hint
Input: Mono, 1rem, transparent bg, no border, blueprint caret
Results:
Scrollable, overscroll-behavior: contain
Thin scrollbar: 4px, --rule-soft
Result Item (.cp-item):
Flex, gap 10px, padding 10px 16px
Border-left: 3px solid transparent → --blueprint on hover/active
Hover bg: --blueprint-tint
Grid body: chip / name / summary / meta
Chip: Mono, 0.6rem, uppercase, blueprint or --ink-mute
Name: Serif, 0.94rem, weight 600, ellipsis
Summary: Serif, 0.8rem, --ink-soft, ellipsis
Meta: Mono, 0.64rem, --ink-mute
Arrow: appears on hover (opacity: 0 → 1)
Footer:
Flex, gap 14px, border-top 1px solid var(--rule-soft)
Kbd hints: Mono, 0.6rem, bordered, --bg-surface
4.5 TOC / Curriculum List
Section Header:
Title: VT323, clamp(1.8rem, 4vw, 2.6rem), blueprint
Subtitle: Mono, 0.85rem, --ink-mute, uppercase
Legend:
Flex, gap 16px, Mono, 0.72rem, uppercase
Dots: 10px circles
Complete: solid --blueprint
In-progress: half-filled --blueprint
Planned: dashed --ink-mute
Phase Row (.toc-row):
Grid layout: phase number | title | lesson count | status dots
Padding: 16px 0
Border-bottom: 1px solid var(--rule-soft)
Hover: bg --blueprint-tint
Cursor: pointer
Status dots: 10px circles in a row, same legend logic
Row Animation:
opacity: 0, translateY(8px) → visible on scroll
Staggered via var(--stagger-delay) custom property
4.6 Stat Block
Grid: 200px minmax(0, 360px) 110px
Label: Mono, uppercase, letter-spacing 0.1em, --ink-soft
Bar: 14px height, --rule-soft bg, blueprint fill
Value: Mono, 0.9rem, uppercase, --ink-mute
4.7 Preface Section
Grid: 200px 1fr, gap 48px
Eyebrow: Mono, 0.74rem, uppercase, blueprint
Body: 2-column, column-gap: 48px, column-rule: 1px solid var(--rule-soft)
Text-align: justify, hyphens: auto
Drop-cap on first paragraph
4.8 Colophon
Mono text, 0.78rem, uppercase
Git clone command in code block: --code-bg background
Copy button: Mono, 0.95rem, --ink-mute → --blueprint on hover
4.9 Footer (.site-footer)
Border-top: 1px solid var(--rule-soft)
Padding: 32px 0
Inner: Flex, space-between
Text: Mono, 0.78rem, uppercase, --ink-mute
Links: Mono, 0.78rem, uppercase, --ink-soft → --blueprint
5. Terminal UI Components (NEW — K8 Playground)
5.1 Terminal Window (.terminal-window)
A macOS-style terminal window for code mockups and live command demonstrations.
Structure:
HTML
<div class="terminal-window">
  <div class="terminal-chrome">
    <div class="terminal-traffic-lights">
      <span class="light close"></span>
      <span class="light minimize"></span>
      <span class="light maximize"></span>
    </div>
    <div class="terminal-title">minime@mac — 80×24</div>
    <div class="terminal-spacer"></div>
  </div>
  <div class="terminal-body">
    <div class="terminal-line">
      <span class="terminal-prompt">minime % </span>
      <span class="terminal-cmd">kubectl get pods</span>
    </div>
    <div class="terminal-output">...</div>
  </div>
</div>
Chrome (Title Bar):
Background: #e5e5e5 (light) / #3d3d3d (dark)
Height: 28px
Padding: 0 12px
Border-radius: 8px 8px 0 0 (only top corners)
Layout: Flex, align-center
Traffic Lights:
12px × 12px circles, gap 8px
Close: #ff5f56 with #e0443e inner shadow
Minimize: #ffbd2e with #dea123 inner shadow
Maximize: #27c93f with #1aab29 inner shadow
Each has 1px solid rgba(0,0,0,0.06) border for definition
Title:
Font: Mono, 0.72rem, color #4a4a4a (light) / #a8a6a0 (dark)
Centered absolutely within chrome
Body:
Background: --terminal-bg (#0d1117 light theme, #0a0d1a dark)
Padding: 16px 20px
Font: Terminal stack, 0.85rem, line-height 1.5
Color: --terminal-text
Border: 1px solid var(--terminal-border)
Border-top: none (seamless with chrome)
Box-shadow: 0 8px 32px rgba(0,0,0,0.24)
Overflow: auto (scrollable for long output)
Prompt:
Prefix: minime %  or user@k8s-master:~$
Color: --terminal-mute
After prompt: blinking cursor (▋) when active
Command Text:
Color: --terminal-text
Typing animation: characters appear sequentially with 0.03s delay per char
Output Text:
Color: --terminal-text
Success lines: prefix ✓ in --terminal-green
Error lines: prefix ✗ in --terminal-red
Labels: prefix in --terminal-cyan (e.g., File:, Size:)
Warnings: --terminal-yellow
Paths / URLs: --terminal-green underlined
Syntax Highlighting (K8 YAML / JSON):
Keys: --terminal-cyan
Strings: --terminal-green
Numbers: --terminal-yellow
Booleans: --terminal-magenta
Comments: --terminal-mute italic
5.2 Terminal Tabs (.terminal-tabs)
For multi-step K8 tutorials with multiple terminal sessions.
Tab Bar:
Positioned above chrome or integrated into chrome
Background: #d4d4d4 (light) / #2d2d2d (dark)
Height: 32px
Padding: 0 8px
Border-bottom: 1px solid var(--terminal-border)
Tab Item:
Font: Mono, 0.75rem
Padding: 6px 16px
Color: --terminal-mute
Border-bottom: 2px solid transparent
Active: color --terminal-text, border-bottom --terminal-cyan
Hover: bg rgba(255,255,255,0.04)
Close button (×) appears on hover, 14px, --terminal-mute → --terminal-red
New Tab Button (+):
28px × 28px, centered
Color: --terminal-mute
Hover: color --terminal-text, bg rgba(255,255,255,0.06)
5.3 TUI Panel (.tui-panel)
Retro terminal UI panels for structured output (inspired by binsider).
Panel Box:
Background: --tui-bg
Border: 1px solid var(--tui-border) or 2px solid var(--tui-border) for emphasis
Padding: 12px 16px
Font: TUI stack (VT323), 0.9rem
Color: --tui-text
Box-shadow: 0 0 0 1px var(--tui-border), 0 4px 16px rgba(0,0,0,0.4)
No border-radius
Panel Title / Header:
Font: VT323, 1.2rem, uppercase, letter-spacing 0.08em
Color: --tui-text
Optional: centered with horizontal line borders extending to edges
Example: ─── Dependencies ───
Panel Subtitle:
Font: Mono, 0.72rem, italic
Color: --tui-gold
Example: Analyze ELF binaries like a boss.
Label-Value Pairs:
Label: Mono, 0.82rem, --tui-cyan, right-aligned or followed by colon
Value: Mono, 0.82rem, --tui-text
Layout: 2-column grid, 120px 1fr or flex with min-width: 120px label
Table (TUI Style):
Header row: border-bottom 2px solid var(--tui-border)
Header text: Mono, 0.78rem, uppercase, --tui-cyan
Row text: Mono, 0.82rem, --tui-text
Row hover: bg rgba(86, 182, 194, 0.06)
Column separator: │ character or 1px solid var(--tui-border)
Alternating rows: subtle rgba(255,255,255,0.02) bg
Tab Navigation (TUI Style):
Position: top of panel
Active tab: bg --tui-bg, border 1px solid var(--tui-border), border-bottom none (overlaps panel border)
Inactive tab: --tui-mute, no border
Tab text: Mono, 0.78rem, uppercase
Separator: │ between tabs
Bottom Key Hints Bar:
Position: bottom of panel or page
Background: --tui-bg
Border-top: 1px solid var(--tui-border)
Padding: 8px 16px
Font: Mono, 0.72rem
Key: --tui-magenta in brackets, e.g., [Enter→Analyze]
Description: --tui-text
Separators: space between groups
5.4 Code Block with Terminal Overlay (.code-terminal)
For showing code that "runs" in a terminal context.
Structure:
HTML
<figure class="code-terminal">
  <div class="terminal-window">
    <div class="terminal-chrome">...</div>
    <div class="terminal-body">
      <pre class="terminal-pre"><code>...</code></pre>
    </div>
  </div>
  <figcaption class="fig-label">Figure 004 — K8 Deployment YAML</figcaption>
</figure>
Pre/Code inside Terminal:
Background: transparent (inherits terminal-body)
Padding: 0 (body handles it)
Overflow-x: auto
Scrollbar: 4px, --terminal-border
Copy Button:
Position: absolute, top-right of terminal-body, 8px from edges
Background: rgba(13, 17, 23, 0.8)
Border: 1px solid var(--terminal-border)
Color: --terminal-mute
Font: Mono, 0.75rem
Padding: 4px 10px
Hover: color --terminal-cyan, border --terminal-cyan
Active: bg --terminal-cyan, color --terminal-bg
5.5 Interactive Playground (.k8-playground)
A full interactive area for K8 learning with terminal + TUI + controls.
Layout:
Grid: 1fr 320px (terminal | sidebar) on desktop
Stack vertically on mobile
Gap: 24px
Background: --bg-surface
Border: 1px solid var(--rule-soft)
Padding: 24px
No border-radius
Terminal Area:
Takes full left column
Terminal window as defined above
Minimum height: 400px
Sidebar (TUI Style):
Background: --tui-bg
Border: 1px solid var(--tui-border)
Padding: 16px
Contains:
Status Panel: Current K8 context, namespace, node status
Resource Panel: Pods, Services, Deployments counts
Log Panel: Streaming log output in TUI style
Control Panel: Buttons to run commands, reset, next step
Control Buttons:
Font: Mono, 0.78rem, uppercase
Padding: 8px 16px
Border: 1px solid var(--tui-border)
Background: transparent
Color: --tui-text
Hover: bg --tui-cyan, color --tui-bg, border --tui-cyan
Active: translate 1px 1px
Primary: bg --tui-cyan, color --tui-bg
Step Indicator:
Font: Mono, 0.72rem, uppercase
Color: --tui-mute
Current step: --tui-cyan
Steps separated by → or ›
5.6 Typing Animation (.typewriter)
For simulating command entry in terminal windows.
CSS Animation:
css
.typewriter-cursor {
  display: inline-block;
  width: 8px;
  height: 1.2em;
  background: var(--terminal-cyan);
  animation: blink 1s step-end infinite;
  vertical-align: text-bottom;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
JS Behavior:
Characters append one-by-one with 30ms delay
Cursor follows last character
On complete: cursor continues blinking for 2s then fades
Output appears after command "execution" delay (400ms)
Output lines can stagger in with 80ms delay per line
5.7 K8 Resource Visualization (.k8-viz)
ASCII-art style diagrams for K8 architecture inside TUI panels.
Style:
Font: Mono, 0.75rem, line-height 1.4
Nodes: [====] boxes or ○ circles
Connections: │ ─ ├ ┤ characters
Labels: --tui-cyan for resource type, --tui-text for name
Status: color-coded — green (Running), yellow (Pending), red (Failed)
Example:
plain
┌─────────────┐
│  Ingress    │
└──────┬──────┘
       │
┌──────┴──────┐
│   Service   │
└──────┬──────┘
       │
┌──────┴──────┐
│  Deployment │
└──────┬──────┘
       │
┌──────┴──────┐
│    Pod      │
└─────────────┘
6. Motion & Animation
6.1 Easing Tokens
segment.table
Name	Value	Usage
Smooth	cubic-bezier(0.22, 1, 0.36, 1)	Reveals, TOC rows, ASCII rule
Ease	ease	Fades, modal overlay
Linear	linear	Progress bars, typing cursor blink
Step	step-end	Cursor blink, TUI frame updates
6.2 Scroll Reveals (.reveal)
Default: opacity: 0, translateY(20px) (or translateX(-20px) for .reveal--left)
In-view: opacity: 1, transform: none
Duration: 0.7s (reveal), 0.5s (TOC rows), 1.1s (ASCII rule)
Staggered via inline --stagger-delay CSS variable
6.3 Title Flicker
css
@keyframes title-flicker {
  0%, 100% { opacity: 1; }
  18%  { opacity: 0.4; }
  20%  { opacity: 1; }
  62%  { opacity: 0.7; }
  64%  { opacity: 1; }
}
Applied to .manual-title once on load (2.4s ease-out 0.1s 1)
6.4 ASCII Rule Reveal
clip-path: inset(0 100% 0 0) → inset(0 0 0 0)
Duration: 1.1s with smooth easing
6.5 Modal Transitions
Overlay: opacity 0.2s
Panel: translateY(16px) → 0, 0.25s ease
6.6 Command Palette
Backdrop: opacity 0.15s
Panel: translateY(-12px) → 0, opacity 0.16s / 0.2s
6.7 Terminal Animations
Window open: scale(0.96) → scale(1), opacity 0 → 1, 0.3s smooth
Typing: per-character append, 30ms delay
Output reveal: opacity 0 → 1, translateY(4px) → 0, 0.2s per line, stagger 80ms
Cursor blink: 1s step-end infinite
Traffic light hover: scale(1.1), 0.15s
6.8 TUI Panel Animations
Panel open: opacity 0 → 1, 0.15s (instant, snappy feel)
Tab switch: content cross-fade 0.1s
Table row hover: bg transition 0.08s
Key hint press: scale(0.95) → scale(1), 0.1s
6.9 Reduced Motion
css
@media (prefers-reduced-motion: reduce) {
  .reveal, .ascii-rule, .toc-row, .stat-row-bar::before, .manual-title,
  .terminal-window, .tui-panel, .typewriter-cursor {
    transition: none !important;
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    clip-path: none !important;
  }
}
7. Responsive Breakpoints
segment.table
Breakpoint	Behavior
≥1440px	Container expands to 1240px; playground sidebar 380px
≤1024px	Container padding 24px; playground stacks vertically
≤768px	Nav links hidden, header 56px, section padding 48px 0, buttons full-width, modal full-width, footer stacks, playground sidebar becomes bottom drawer
≤480px	Body font 16px, logo 1rem, terminal font 0.78rem, TUI font 0.82rem, playground minimum height 300px
8. Assets & Icons
8.1 Favicon
SVG data-URI: 32×32 square with off-white bg (#fafaf5), blueprint border (#3553ff, 1.2px), "AI" text in monospace
8.2 OG Image
https://aiengineeringfromscratch.com/og-image.png?v=3
8.3 Iconography
No icon font — all icons are inline SVG
Icons used: GitHub, Star, Sun/Moon (theme), Search, ChevronRight, Copy, Terminal, K8s, Play, Pause, Reset, Check, X, Warning
All icons: currentColor, flex-shrink 0
Terminal-specific icons: 12px for traffic lights, 14px for tab close
8.4 Terminal Cursor
Block cursor: ▋ (U+258B) or custom 8px × 1.2em div
Color: --terminal-cyan
Blink: 1s step-end infinite
9. Page Structure (Index + Playground)
plain
<body>
  ├─ <a class="skip-link">Skip to content</a>
  ├─ <header class="site-header">
  │   └─ <div class="header-inner">
  │       ├─ <a class="logo">[icon] AI Engineering from Scratch</a>
  │       └─ <nav class="header-nav">
  │           ├─ <a>How this works</a>
  │           ├─ <a>Curriculum</a>
  │           ├─ <a>Glossary</a>
  │           ├─ <a>Playground</a>  ← NEW
  │           ├─ <button class="search-toggle">⌘K</button>
  │           ├─ <a class="header-github">[star] Star [count]</a>
  │           └─ <button class="theme-toggle">☀/☾</button>
  │
  ├─ <main id="main">
  │   ├─ <section class="manual-masthead container">...</section>
  │   ├─ <section class="preface container">...</section>
  │   ├─ <section class="figure-demo container">...</section>
  │   ├─ <section class="stat-block container">...</section>
  │   ├─ <section class="toc container" id="curriculum">...</section>
  │   │
  │   ├─ <section class="playground-section container" id="playground">  ← NEW
  │   │   ├─ <h2 class="section-title">K8 Playground</h2>
  │   │   ├─ <p class="section-subtitle">Terminal UI · TUI · Live Commands</p>
  │   │   └─ <div class="k8-playground">
  │   │       ├─ <div class="terminal-area">
  │   │       │   └─ <div class="terminal-window">[chrome + body + typing]</div>
  │   │       └─ <aside class="tui-sidebar">
  │   │           ├─ <div class="tui-panel">[Status]</div>
  │   │           ├─ <div class="tui-panel">[Resources]</div>
  │   │           └─ <div class="tui-panel">[Controls]</div>
  │   │       </aside>
  │   │   </div>
  │   │
  │   ├─ <section class="code-showcase container">  ← NEW (Code Mockups)
  │   │   └─ <figure class="code-terminal">[Terminal Window with YAML]</figure>
  │   │
  │   └─ <section class="colophon container">...</section>
  │
  ├─ <footer class="site-footer">...</footer>
  ├─ <div id="modalOverlay" class="modal-overlay">[Phase detail modal]</div>
  └─ <div id="cmdPalette">[Command palette]</div>
10. JavaScript Architecture (Design-Related)
segment.table
File	Responsibility
data.js	Curriculum data, phase/lesson definitions, glossary
progress.js	LocalStorage progress tracking, stat calculations
header.js	Header scroll behavior, theme toggle, mobile nav
cmdpalette.js	Cmd+K search, fuzzy filtering, keyboard navigation
app.js	Modal rendering, TOC interactions, scroll reveals, clone button
terminal.js	Terminal window rendering, typing animation, command execution simulation
tui.js	TUI panel rendering, tab switching, ASCII diagram generation
playground.js	K8 playground orchestration, step progression, state management
k8-viz.js	ASCII art K8 architecture diagrams, resource tree rendering
11. Accessibility
Skip Link: Absolute positioned, visible on focus, blueprint bg
Focus States: outline: 2px solid var(--ink); outline-offset: 2px
Reduced Motion: Respects prefers-reduced-motion — disables all terminal animations, typing, cursor blink, reveals
Semantic HTML: <main>, <section>, <header>, <footer>, <nav>, <figure>, <figcaption>
ARIA:
Modal has role="dialog", aria-modal="true"
Terminal has role="log", aria-live="polite" for output
TUI tabs have role="tablist", role="tab", role="tabpanel"
Playground has role="application" for interactive terminal area
Color Contrast: All text meets WCAG AA against both light/dark backgrounds
Terminal Contrast: Terminal text uses #e6edf3 on #0d1117 (ratio ~12:1)
Keyboard Navigation:
Tab cycles through terminal controls
Enter executes focused command
ESC closes terminal overlays
Cmd/Ctrl+K opens command palette from anywhere
12. File Inventory
segment.table
File	Type	Size	Notes
index.html	Entry	~12 KB	Includes playground sections
style.css?v=20260525a	Stylesheet	~27 KB	Base + terminal + TUI styles
data.js?v=20260525a	Data	—	Curriculum + K8 command definitions
progress.js?v=20260525a	Logic	—	Progress tracking
header.js?v=20260525a	Logic	—	Header + theme
cmdpalette.js?v=20260525a	Logic	—	Global search
app.js?v=20260525a	Logic	—	Modal + TOC + reveals
terminal.js?v=20260525a	Logic	—	Terminal UI component
tui.js?v=20260525a	Logic	—	TUI panel component
playground.js?v=20260525a	Logic	—	K8 playground orchestration
og-image.png?v=3	Asset	—	Social share image
End of Design Science Document — AI Engineering from Scratch with K8 Terminal Playground