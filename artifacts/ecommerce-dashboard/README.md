# StreamIQ — E-Commerce Intelligence Platform

A static analytics dashboard built with plain HTML, CSS, and JavaScript.
No frameworks, no build step required.

---

## Running on Windows

You have **three** options, ordered from simplest to most powerful:

### Option 1 — Double-click (no install)

The simplest way. Just open the folder in **File Explorer** and
double-click **`index.html`** (or **`start.bat`**).
The dashboard opens in your default browser. That's it.

> Works in Chrome, Edge, Firefox. No Node.js or npm required.

### Option 2 — Local web server (recommended)

For best results (and no `file://` quirks), serve the folder with any
static web server. With Node.js installed, open **PowerShell** or **cmd**
in this folder and run:

```cmd
npx serve
```

Then open <http://localhost:3000> in your browser.

### Option 3 — Vite dev server (with hot reload)

If you want auto-refresh while editing:

```cmd
npm install
npm run dev
```

Then open <http://localhost:3000>.

---

## File structure

```
nexora/
├── index.html      ← the page
├── style.css       ← all styling (light + dark themes)
├── app.js          ← all logic, mock data, charts
├── favicon.svg     ← favicon
├── package.json    ← optional, for `npm run dev`
└── vite.config.js  ← optional, for `npm run dev`
```

Everything is in **3 source files**: `index.html`, `style.css`, `app.js`.
Open them in any text editor (Notepad, VS Code, Notepad++) to customize.

---

## Cross-platform notes

This project is pure HTML/CSS/JS — it runs identically on
**Windows, macOS, and Linux**. The optional Vite dev server uses
cross-platform Node.js commands and works in **cmd**, **PowerShell**,
**Git Bash**, and **WSL** without modification.
