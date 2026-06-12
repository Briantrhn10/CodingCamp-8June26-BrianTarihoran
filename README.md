# Focus Dashboard

A clean, minimal productivity dashboard built with plain HTML, CSS, and Vanilla JavaScript. No frameworks, no backend — everything runs in the browser and data is saved locally.

![Focus Dashboard](https://img.shields.io/badge/built%20with-HTML%20%7C%20CSS%20%7C%20JavaScript-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Features

### Greeting & Clock
- Live clock that updates every second
- Time-aware greeting (Good morning / afternoon / evening / night)
- Custom name support — set your name in Settings

### Focus Timer (Pomodoro)
- Default 25-minute focus session (fully customizable)
- Start, Pause, and Reset controls
- Animated progress bar
- Browser notification when the session ends

### To-Do List
- Add, edit, and delete tasks
- Mark tasks as done
- Duplicate task prevention
- Sort by: Newest, Oldest, A→Z, Z→A, Active first, Done first
- All tasks saved in Local Storage

### Quick Links
- Save your favourite websites as one-click buttons
- Auto-fetches favicons for each link
- Links open in a new tab
- Saved in Local Storage

### Light / Dark Mode
- Toggle between light and dark themes
- Automatically respects your system preference on first load
- Theme preference is saved

---

## Project Structure

```
├── index.html        # App markup
├── css/
│   └── style.css     # All styles (single file)
├── js/
│   └── app.js        # All logic (single file)
└── README.md
```

---

## Tech Stack

| Layer   | Technology          |
|---------|---------------------|
| Structure | HTML5             |
| Styling   | CSS3 (custom properties, grid, flexbox) |
| Logic     | Vanilla JavaScript (ES6+) |
| Storage   | Browser Local Storage API |

---

## Getting Started

No build steps or installs needed.

1. Clone the repo:
   ```bash
   git clone https://github.com/Briantrhn10/CodingCamp-8June26-BrianTarihoran.git
   ```
2. Open `index.html` in any modern browser.

That's it.

---

## Browser Support

Works in all modern browsers — Chrome, Firefox, Edge, and Safari.

---

## Author

**Brian Tarihoran** — CodingCamp Project, June 2026
