# RoktoKorobi UI/UX Styling Guide

## Button Component

### Variants
- **primary**: Red background, white text (primary actions)
- **secondary**: Gray background, dark text (alternative actions)
- **ghost**: Transparent, colored text (minimal actions)
- **icon**: Transparent, circular (icon-only buttons)

### Sizes
- **sm**: 32px min-height, small padding (secondary actions)
- **md**: 44px min-height, medium padding (default)
- **lg**: 56px min-height, large padding (primary CTAs)

### Usage
```tsx
import { Button } from '@/components/ui/Button';

// Primary button
<Button variant="primary" size="lg">Register as Donor</Button>

// Icon button
<Button variant="icon" size="md" aria-label="Close">✕</Button>
```

## Floating Action Buttons (FABs)

### Sizing
- **SOS Button**: 56-64px circle, fixed 24px from right and bottom (desktop)
- **Share Button**: 48-56px circle, 12-16px below SOS

### Mobile Behavior
- Maintain safe-area spacing
- Reduce to 48px and 44px on small screens
- Prevent overlap with page content

## Header

### Desktop (>1200px)
- Show all navigation links
- "More" menu for additional items
- Language toggle and user profile

### Tablet (768px - 1200px)
- Navigation links in dropdown
- "More" menu visible
- Responsive spacing

### Mobile (<768px)
- Hamburger menu opens full navigation
- All links in mobile menu
- Bottom navigation optional

## Form Controls

### Heights
- **Input/Select**: 52-56px minimum
- **Buttons**: 44px (secondary), 56px (primary)

### Spacing
- Label to input: 8px gap
- Input to error message: 4px gap
- Input to next field: 16px gap

### States
- **Default**: Gray border, light gray background
- **Focus**: Red border, subtle red shadow
- **Invalid**: Red border, light red background
- **Disabled**: Gray background, reduced opacity

## Colors

### Primary
- **Red**: #dc2626 (primary actions)
- **Dark Red**: #b91c1c (hover state)

### Neutrals
- **Dark**: #1a1a1a (text)
- **Gray**: #666666 (secondary text)
- **Light Gray**: #f5f5f5 (backgrounds)

### Status
- **Success**: #22c55e (eligible)
- **Error**: #ef4444 (ineligible)
- **Warning**: #eab308 (caution)

## Responsive Breakpoints

```
Mobile:    < 640px
Tablet:    640px - 1024px
Desktop:   1024px - 1280px
Wide:      > 1280px
```

## Accessibility

- Minimum touch target: 44×44px
- Focus indicators: 2px ring with 2px offset
- Color contrast: WCAG AA minimum (4.5:1 for text)
- Keyboard navigation: All interactive elements
- ARIA labels for icon-only buttons
