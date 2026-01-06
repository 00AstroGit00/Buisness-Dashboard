# Business Dashboard Assets

This directory contains generated branding assets, UI components, and mock data for your business dashboard project.

## Directory Structure

```
dashboard_assets/
├── avatars/          # SVG user avatars with brand colors
├── charts/           # Static PNG exports of sample charts
├── css/
│   └── brand_theme.css  # CSS variables for colors and fonts
├── icons/            # SVG UI icons (feather-style) colored to match brand
├── Business_Logo.svg # Vectorized scalable logo
├── dashboard_data.json # JSON data source for charts/widgets
└── index.html        # Preview gallery
```

## How to Use

### 1. CSS Theme
Import the theme in your main CSS file or HTML head:
```html
<link rel="stylesheet" href="assets/css/brand_theme.css">
```
Use the variables in your styles:
```css
.my-button {
    background-color: var(--color-primary);
    color: var(--color-bg-light);
}
```

### 2. Icons & Logo
Icons are standard SVGs. You can use them directly in `<img>` tags or inline them into your HTML for CSS styling control.

### 3. Data Integration
Load `dashboard_data.json` asynchronously to populate your UI widgets:

```javascript
fetch('assets/dashboard_data.json')
  .then(response => response.json())
  .then(data => {
      console.log(data.dashboard_stats.total_revenue);
      // Update UI...
  });
```
