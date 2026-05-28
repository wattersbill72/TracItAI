# Issue 003 — UI Component Primitives & Design System

**Phase:** 0 — Foundation  
**Depends on:** Issue 001  
**Branch:** `feature/issue-003-ui-primitives`

---

## Objective

Build the base UI component library that all pages and features use. Components should be clean, accessible, and consistent. This is not a feature — it is the design system foundation. All subsequent issues import from here.

---

## Acceptance Criteria

- [ ] All components listed below exist and render without errors
- [ ] Components are accessible (correct ARIA roles, keyboard navigation)
- [ ] All components accept a `className` prop for overrides
- [ ] Storybook OR a simple `/dev/components` route shows all components — choose the route approach (no Storybook setup overhead)
- [ ] Dark mode support via Tailwind `dark:` classes — respects system preference

---

## Color Palette — TracItAI Brand

Golf-grounded, premium but approachable. Implement as Tailwind CSS custom colors.

```typescript
// tailwind.config.ts
colors: {
  brand: {
    green: {
      50:  '#E8F5EE',
      100: '#C5E8D3',
      500: '#1D9E75',   // primary CTA
      600: '#178A63',
      700: '#0F6E50',
      900: '#063D2C',
    },
    slate: {
      50:  '#F4F6F8',
      100: '#E8ECF0',
      500: '#5A6A7A',
      700: '#374555',
      900: '#1A2432',   // dark backgrounds
    },
    gold: {
      400: '#EF9F27',   // accent / warning
      500: '#D4860F',
    }
  }
}
```

---

## Components to Build

### src/components/ui/Button.tsx
Props: `variant` (primary|secondary|ghost|danger), `size` (sm|md|lg), `loading` (boolean), `disabled`, `onClick`, `type`, `className`, `children`
- Primary: brand-green background, white text
- Secondary: white background, brand-green border + text
- Ghost: no border, subtle hover
- Loading state: spinner replaces children, button disabled

### src/components/ui/Input.tsx
Props: `label`, `error`, `hint`, `type`, `placeholder`, `disabled`, `className`, + all standard input props
- Floating label style OR top-label — choose top-label for simplicity
- Error state: red border + error message below
- Always renders with a wrapping div for label + input + error layout

### src/components/ui/Card.tsx
Props: `className`, `children`, `padding` (sm|md|lg), `hover` (boolean — adds hover shadow)

### src/components/ui/Badge.tsx
Props: `variant` (green|blue|amber|red|purple|gray), `size` (sm|md), `children`

### src/components/ui/Modal.tsx
Props: `open`, `onClose`, `title`, `children`, `size` (sm|md|lg|full)
- Renders via React portal
- ESC key closes
- Click outside closes
- Focus trap inside modal

### src/components/ui/Spinner.tsx
Props: `size` (sm|md|lg), `className`

### src/components/ui/Table.tsx
Props: `columns` (array of { key, label, render? }), `data`, `loading`, `emptyMessage`

### src/components/ui/Tabs.tsx
Props: `tabs` (array of { id, label, count? }), `active`, `onChange`
- Underline style (not boxed)
- Optional count badge per tab

### src/components/ui/ProgressBar.tsx
Props: `value` (0–100), `color` (green|amber|red|blue), `size` (sm|md)

### src/components/ui/ConfidenceBar.tsx
Specialized ProgressBar for confidence scores. Auto-colors: ≥75% green, 50–74% amber, <50% red. Shows percentage label.

### src/components/ui/EmptyState.tsx
Props: `icon`, `title`, `description`, `action` (optional button config)

### src/components/ui/Alert.tsx
Props: `variant` (info|success|warning|error), `title`, `children`, `onDismiss?`

### src/components/layout/AppShell.tsx
The authenticated app wrapper. Includes:
- Top navigation bar: TracItAI logo, nav links, user menu (name + logout)
- Mobile: hamburger menu
- Main content area with `<Outlet />`

### src/components/layout/AdminShell.tsx
Extends AppShell. Adds admin sidebar nav:
- Dashboard, Users, Waitlist, Invites, Telemetry

### src/components/layout/PublicShell.tsx
Wrapper for public pages (landing, login, etc.)
- TracItAI logo top-left, Login button top-right
- No sidebar

---

## Typography

Use system font stack — no Google Fonts imports for performance.

```typescript
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'Menlo', 'monospace'],
}
```

---

## Notes for Claude Code

- Do not use shadcn/ui, Radix, or any component library — all components are custom
- Tailwind only — no CSS modules, no styled-components
- Export all components from `src/components/ui/index.ts` for clean imports
- Each component file should be self-contained — no cross-component dependencies except layout importing ui primitives
- Accessibility: all interactive elements must have visible focus rings
