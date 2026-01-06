# Business Branding Elements & Dashboard Assets

This project serves two primary purposes:
1.  **Asset Processing Pipeline:** A Python-based automation tool to generate optimized web assets, responsive image variants, and color palettes from raw JPG images.
2.  **Dashboard Design System:** A collection of standardized frontend assets (CSS, SVGs, Mock Data) and a visual Style Guide for a business dashboard application.

## Directory Overview

*   **Root (`/`)**: Contains raw image assets (`.jpg`, `.png`, `.svg`) and the processing script (`process_assets.py`).
*   **`dashboard_assets/`**: Contains the "production-ready" design system.
    *   `index.html`: The interactive Style Guide / Documentation.
    *   `css/brand_theme.css`: CSS variables defining the color palette and typography.
    *   `dashboard_data.json`: Mock JSON data for UI widgets.
    *   `icons/`, `avatars/`: SVG assets.
    *   `charts/`: Static visualization assets.

## Asset Processing Pipeline

The `process_assets.py` script automates the preparation of raw images for web use.

### Prerequisites & Dependencies
- **Python**: 3.x
- **Libraries**:
  - `Pillow>=10.0.0`: Image processing and resizing.
  - `colorthief>=0.2.1`: Dominant color extraction.

Installation:
```bash
pip install Pillow colorthief
```

### Usage
Run the script from the root of the branding directory:
```bash
python process_assets.py
```

### Output Structure
The script generates a `processed_assets/` directory with the following organization:
- `[filename].webp`: Web-optimized version of the original.
- `[filename]_[width]w.jpg`: Responsive variants (480w, 800w, 1200w).
- `catalog.json`: A master index of all assets and extracted metadata.

### `catalog.json` Schema
The catalog serves as a data source for the frontend to dynamically load assets.
```json
{
  "assets": [
    {
      "original": "filename.jpg",
      "variants": [
        { "format": "webp", "path": "./processed_assets/filename.webp" },
        { "width": 480, "path": "./processed_assets/filename_480w.jpg" }
      ],
      "palette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5", "#hex6"]
    }
  ]
}
```

## Dashboard Design System

The `dashboard_assets` folder provides the building blocks for the frontend application.

### Style Guide
Open `dashboard_assets/index.html` in a web browser to view the visual documentation of the design system, including:
*   Logo usage
*   Color palette (Primary/Secondary variations)
*   Iconography
*   Chart visualizations

### Integration Guide

**1. CSS Theme**
Import the central theme file to access design tokens:
```html
<link rel="stylesheet" href="assets/css/brand_theme.css">
```
Usage example:
```css
.element {
    background-color: var(--color-primary-main);
    color: var(--color-secondary-light);
}
```

**2. Data Integration**
The `dashboard_data.json` file contains mock data structures for widgets. Fetch this file asynchronously in your application to populate UI components.

**3. Icons**
Icons are provided as standard SVGs in the `icons/` directory and can be used directly via `<img>` tags or inlined for CSS styling.
