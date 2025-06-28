# EassyAll Customer Web App

A modern, responsive React web application for EassyAll customers, built with Vite and featuring a comprehensive UI design system with shadcn/ui components, TailwindCSS styling, and Three.js animations.

## 🚀 Technology Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: TailwindCSS + shadcn/ui
- **Animations**: Three.js + Framer Motion
- **Language**: TypeScript
- **Routing**: React Router
- **State Management**: Zustand
- **Icons**: Lucide React

## 🎨 Design System & Animation Guidelines

**IMPORTANT**: Before creating any new UI components, always refer to our comprehensive animation and interaction guidelines:

📋 **[UI Animation & Interaction Guidelines](./docs/design-guidelines.md)**

This document contains:
- **Core Design Principles** for smooth, purposeful animations
- **Microinteractions** for wishlist, cart, product cards, and buttons
- **Form Animations** with floating labels, validation, and error states
- **Sidebar & Navigation** behaviors with scroll effects and dropdowns
- **Search Interactions** with predictive UI and loading states
- **Button & CTA Effects** with hover, click, and success animations
- **Scroll-Based Animations** for product reveals and parallax effects
- **Modal & Popup Transitions** with backdrop blur and exit-intent
- **AI-Enhanced Interactions** for predictive suggestions and typing effects
- **Color Palette & Design System** standards
- **Performance Guidelines** and accessibility considerations

## 🛠️ Tech Stack

- **React 19** - UI Library
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - Modern, accessible component library
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **Lucide React** - Icon library

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── auth/           # Authentication components
│   └── landing/        # Landing page components
├── pages/              # Page components
├── router/             # Routing configuration
├── lib/                # Utility functions
├── assets/             # Static assets
│   └── images/         # Image files
└── docs/               # Documentation
    └── design-guidelines.md  # UI Design Guidelines
```

## 🎨 Design System Usage

### Colors
- Primary: `#FFA301` (Orange)
- Backgrounds: `#FCDEBD`, `#FFEDD0`, `#FEEFDB`
- Text: `#000000` (primary), `#888888` (secondary)

### Shadows
- Low: `shadow-low`
- Medium: `shadow-medium`
- High: `shadow-high`

### Components
Always use shadcn/ui components for consistency:
```jsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
```

## 📝 Development Guidelines

1. **Always refer to the animation guidelines** before creating new components
2. **Use shadcn/ui components** for consistency and accessibility
3. **Implement microinteractions** for every user action (clicks, hovers, focus)
4. **Use Framer Motion** for complex animations and transitions
5. **Add loading states** with skeleton screens or shimmer effects
6. **Ensure smooth performance** - test animations on mobile devices
7. **Follow accessibility standards** including `prefers-reduced-motion`
8. **Implement scroll-based animations** for engaging user experiences

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📚 Documentation

- [UI Animation & Interaction Guidelines](./docs/design-guidelines.md) - Complete animation system
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Design Inspiration Sources](./docs/design-guidelines.md#-12-design-inspiration-sources)

## 🎯 Key Features

- ✅ **Comprehensive Animation System** with microinteractions and smooth transitions
- ✅ **Modern Authentication Modals** with shadcn/ui and Framer Motion
- ✅ **Responsive Design** with mobile-first approach and gesture support
- ✅ **AI-Enhanced Interactions** with predictive UI and typing effects
- ✅ **Performance-Optimized Animations** respecting accessibility preferences
- ✅ **Consistent Design System** with orange color palette and elevation shadows
- ✅ **Advanced Form UX** with floating labels, real-time validation, and error animations
- ✅ **Dynamic Navigation** with scroll behaviors and animated dropdowns

Remember: **Always check the animation guidelines before implementing new UI components!**

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (>=16.0.0)
- npm or yarn package manager

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/eassydev/customer_web_app.git
   cd webapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Required Environment Variables**
   ```env
   VITE_API_BASE_URL=https://api.eassyall.com
   VITE_APP_NAME=EassyAll Customer Portal
   VITE_ENABLE_ANALYTICS=true
   ```

## 🧪 Testing

```bash
# Unit tests
npm run test

# Component tests
npm run test:components

# E2E tests
npm run test:e2e

# Test with coverage
npm run test:coverage

# Visual regression tests
npm run test:visual
```

## 🔒 Security

- Content Security Policy (CSP)
- HTTPS enforcement
- Secure authentication flow
- XSS protection
- CSRF protection
- Dependency vulnerability scanning

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deployment Targets
- **Vercel**: Auto-deployed on push to main
- **Netlify**: Alternative deployment option
- **AWS S3 + CloudFront**: Enterprise deployment
- **GitHub Pages**: Documentation deployment

## 🤝 Contributing

1. Create a feature branch: `git checkout -b webapp/feature/your-feature`
2. Make your changes following React best practices
3. Run tests: `npm test`
4. Run linting: `npm run lint`
5. Commit with proper message: `[WEBAPP] feat: add your feature`
6. Push and create a Pull Request

### Commit Message Format
```
[WEBAPP] type: description

Types: feat, fix, docs, style, refactor, test, chore
```

### Code Style Guidelines
- Follow React best practices
- Use TypeScript for type safety
- Implement responsive design
- Follow accessibility guidelines (WCAG 2.1 AA)
- Use semantic HTML elements
- Optimize for performance

## 📊 Performance

### Optimization Features
- Code splitting with React.lazy()
- Image optimization and lazy loading
- Bundle size monitoring
- Tree shaking
- CSS purging
- Service worker for caching

### Performance Monitoring
- Web Vitals tracking
- Lighthouse CI integration
- Real User Monitoring (RUM)
- Error boundary implementation

## 🚨 Troubleshooting

### Common Issues

1. **Build Errors**
   ```bash
   npm run clean
   npm install
   npm run build
   ```

2. **TypeScript Errors**
   - Check `tsconfig.json` configuration
   - Run `npm run type-check`

3. **Styling Issues**
   - Verify TailwindCSS configuration
   - Check component imports from shadcn/ui

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check the design guidelines documentation
- Contact the frontend development team

## 📄 License

This project is proprietary software owned by EassyDev.

---

**Note**: This web app is part of the EassyAll multi-repository workspace. Ensure changes are only made to web-related files and follow the repository isolation rules defined in `.augment/rules.yaml`.
