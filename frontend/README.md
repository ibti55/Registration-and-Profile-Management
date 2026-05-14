# BPSC Base UI Template

A professional, production-ready React template for Bangladesh Public Service Commission (BPSC) applications with modern UI/UX design and Bangladesh government branding.

> **Note**: This documentation was generated with AI assistance, but with human moderation. 

## Features

### Design System
- **Bangladesh Government Branding**: Official color palette from Bangladesh flag and government seal
  - Primary: Green `rgb(68, 150, 83)`
  - Accent: Red `rgb(217, 59, 52)`
  - Highlight: Yellow `rgb(250, 239, 87)`
- **Dark/Light Mode**: Persistent theme toggle with smooth transitions
- **Responsive Design**: Mobile-first approach with collapsible sidebar
- **Professional UI**: Clean, modern interface with gradient backgrounds and subtle shadows

### UI Components (shadcn/ui)
- Collapsible sidebar with icon mode
- Dropdown menus with profile section
- Navigation with active states
- Theme toggle component
- Fully accessible and customizable

### Routing & Layout
- React Router v6 for client-side navigation
- Sidebar layout wrapper for authenticated pages
- Full-width landing page
- Pre-built pages:
  - Landing page with hero, features, metrics, testimonials, and FAQ sections
  - Dashboard with performance metrics and activity highlights
  - Inbox, Reports, Documents, Users, Settings pages

### Developer Experience
- **TypeScript**: Full type safety across the codebase
- **Vite**: Lightning-fast HMR and optimized builds
- **Tailwind CSS**: Utility-first styling with custom theme variables
- **ESLint**: Code quality and consistency
- **Path Aliases**: Clean imports with `@/` prefix

### Project Structure
```
src/
├── assets/          # Images and static files (Government Seal)
├── components/
│   ├── common/      # Reusable components
│   ├── features/    # Feature-specific components
│   ├── layout/      # Layout components (sidebar-layout)
│   └── ui/          # shadcn/ui components
├── config/          # Configuration files (nav-config)
├── constants/       # App-wide constants
├── hooks/           # Custom React hooks
├── pages/           # Route page components
├── styles/          # Global CSS and theme
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Base

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

## Customization

### Theme Colors
Edit `src/styles/globals.css` to customize the color scheme:

```css
:root {
  --primary: rgb(68, 150, 83);  /* Bangladesh green */
  --accent: rgb(217, 59, 52);   /* Bangladesh red */
  --chart-3: rgb(250, 239, 87); /* Bangladesh yellow */
  /* ... more variables */
}
```

### Navigation Menu
Update `src/config/nav-config.ts` to modify sidebar navigation:

```typescript
export const MAIN_NAV = [
  { title: "Dashboard", icon: Home, href: "/dashboard" },
  // Add your menu items here
]
```

### Add New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Update navigation in `src/config/nav-config.ts`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
