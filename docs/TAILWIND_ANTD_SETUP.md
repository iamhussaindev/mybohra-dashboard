# Tailwind CSS + Ant Design Integration

This document explains how Tailwind CSS and Ant Design are configured to work together without style conflicts.

## Configuration Overview

### 1. Tailwind Config (`tailwind.config.ts`)

- **`important: true`** - Makes all Tailwind utilities use `!important` to override Ant Design styles
- **`preflight: true`** - Keeps Tailwind's base/reset styles active

### 2. CSS Layers (`globals.css`)

CSS layers are used to control specificity and order:

```css
@layer antd, tailwind-utilities, custom;
```

**Layer Priority (lowest to highest):**

1. `antd` - Ant Design component customizations
2. `tailwind-utilities` - Tailwind utility classes (auto-applied with `important: true`)
3. `custom` - Custom utilities and overrides

This ensures:

- Ant Design styles have the lowest priority
- Tailwind utilities can override Ant Design
- Custom utilities have the highest priority

### 3. Ant Design Provider (`AntdConfigProvider.tsx`)

- **`cssVar: true`** - Uses CSS variables instead of inline styles
- **`hashed: false`** - Prevents class name hashing for better debugging

## Best Practices

### ✅ DO:

- Use Tailwind utility classes directly on elements
- Apply Tailwind classes to override Ant Design components
- Use the `className` prop on Ant Design components

```tsx
<Button className="bg-blue-600 hover:bg-blue-700 text-white">Custom Button</Button>
```

### ❌ DON'T:

- Use inline styles when Tailwind utilities exist
- Mix CSS-in-JS with Tailwind utilities unnecessarily
- Import Ant Design's reset.css (it's disabled in globals.css)

## Examples

### Override Ant Design Button

```tsx
// Tailwind will override Ant Design's default button styles
<Button type="primary" className="bg-gradient-to-r from-purple-600 to-blue-600 border-none">
  Gradient Button
</Button>
```

### Custom Form Styling

```tsx
<Form.Item className="mb-6">
  <Input className="rounded-lg border-2 border-gray-300 focus:border-blue-500" />
</Form.Item>
```

### Custom Card

```tsx
<Card className="shadow-xl rounded-2xl border-none">
  <p className="text-gray-600 text-sm">Custom card content</p>
</Card>
```

## Troubleshooting

### Styles Not Applying?

1. Check if Tailwind's `important` flag is enabled in config
2. Verify CSS layers are defined in globals.css
3. Clear `.next` cache: `rm -rf .next && npm run dev`

### Ant Design Overriding Tailwind?

- Ensure the element doesn't have inline styles
- Check if there are conflicting custom CSS rules
- Use browser DevTools to inspect specificity

### Build Warnings?

- Run `npm run build` to check for CSS conflicts
- Verify all CSS is valid within layer blocks

## Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Ant Design Documentation](https://ant.design/)
- [CSS Cascade Layers](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)
