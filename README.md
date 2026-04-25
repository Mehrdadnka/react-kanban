# ⚛️ React Kanban Board

A high-performance, modern Kanban board built with React and TypeScript, featuring a custom router, drag-and-drop, and a beautiful, responsive UI.

![Kanban Board Screenshot](public/Screenshot.png)

## ✨ Features

- **🗂️ Drag-and-Drop:** Seamlessly move tasks between "To Do", "In Progress", and "Done" columns using `@dnd-kit`.
- **🧭 Custom Client-Side Router:** Built entirely from scratch (no React Router) with a custom history stack and nested layout support.
- **🧠 Zustand State Management:** Fast, scalable state management with a clean separation of concerns.
- **🎨 Modern UI/UX:** Crafted with Tailwind CSS and Radix UI primitives for a polished, accessible design.
- **🌓 Dark & Light Mode:** Full theme support with smooth transitions.
- **📱 Fully Responsive:** Works flawlessly on desktop, tablet, and mobile.
- **🔍 Live Search:** Floating command-palette-style search to quickly find any task.
- **⚡ Instant Task Creation:** Floating action button (FAB) for quick task addition from anywhere.
- **🎯 Priority Badges:** Visual indicators for Low, Medium, and High priority tasks.

## 🛠️ Tech Stack

- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + Radix UI
- **State Management:** Zustand
- **Drag-and-Drop:** `@dnd-kit/core` + `@dnd-kit/sortable`
- **Architecture:** Custom Router, Separation of Concerns, Provider Pattern

## 📦 Project Structure

Here’s a quick look at the project's clean architecture:

```
src/
├── components/         # Reusable UI & Kanban components
│   ├── board/          # KanbanBoard, Column, TaskCard, TaskDialog
│   └── ui/             # Button, Card, Badge, etc.
├── providers/          # AppProvider (theme, clock, etc.)
├── router/             # My custom client-side router 🛠️
├── stores/             # Zustand stores (tasks, ui)
├── lib/                # Utility functions
└── App.tsx
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm (Recommended) or npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Mehrdadnka/react-kanban.git
   cd react-kanban
   ```

2. Install dependencies:
   ```bash
   pnpm install
   # or
   npm install
   # or clean install
   npm ci
   ```

3. Start the development server:
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
pnpm run build
# The output will be in the `dist/` folder.
```

## 📚 What I Learned & Challenges

This project was a deep dive into React internals and modern front-end architecture:
- **Custom Router:** Implemented `pushState`, `popState`, and a `navigate` function from scratch to understand how React Router works under the hood.
- **Advanced Drag-and-Drop:** Handled complex DnD state with `@dnd-kit` including drag overlays and cross-column movement.
- **Architecture Patterns:** Applied Separation of Concerns and the Provider pattern for a clean, testable codebase.
- **UI Primitives:** Leveraged Radix UI for unstyled, accessible components, custom-styled with Tailwind.

## 🤝 Contributing

This is a personal showcase project, but if you have any ideas or find a bug, feel free to open an issue!

## 📬 Contact

- **GitHub:** [@Mehrdadnka](https://github.com/Mehrdadnka)
- **Email:** [mehrdad2762@gmail.com]

---

**⭐ If you like this project, please give it a star! It means a lot.**
