# Copilot Instructions for Deepa Project

This document outlines key aspects of the Deepa codebase to help AI coding agents be immediately productive.

## 1. Big Picture Architecture

The project consists of a React frontend application built with Vite and TypeScript, complemented by Python scripts for asset processing and data management.

### Frontend (React + Vite + TypeScript)
- **Location**: `src/` directory.
- **Structure**: Follows a component-based architecture with:
    - `src/components/`: Reusable UI components (e.g., `Dashboard.tsx`, `Inventory.tsx`).
    - `src/context/`: React Context for global state management.
    - `src/hooks/`: Custom React hooks for reusable logic.
    - `src/store/`: Centralized state management (e.g., Zustand, Redux-like patterns).
    - `src/utils/`: General utility functions.
    - `src/workers/`: Web workers for offloading heavy computations.
- **Data Flow**: The frontend consumes data primarily from local JSON files and potentially other API endpoints. It is responsible for rendering interactive dashboards and managing user interactions.

### Backend/Data Processing (Python & JavaScript Scripts)
- **Branding Assets**: `Buisiness-Branding-Elements/process_assets.py` is used to process branding elements and related assets.
- **Image Optimization**: `scripts/optimize-images.js` handles image optimization for public assets.
- **Data Sources**: The application interacts with various data sources found in:
    - `Buisiness-Branding-Elements/dashboard_assets/dashboard_data.json`: Mock data for dashboard components.
    - `Business-documents/`: Contains financial records, sales data, inventory, and compliance documents. The frontend likely processes and visualizes data derived from these documents.

## 2. Critical Developer Workflows

### Running the Development Server
To start the React development server:
```bash
npm install
npm run dev
```

### Useful npm scripts (from `package.json`)
- `npm run dev` — start Vite dev server (HMR).
- `npm run build` — type-check (tsc -b) then build with Vite.
- `npm run build:prod` — runs image optimization, then type-check and production build.
- `npm run optimize:images` — runs `scripts/optimize-images.js` to generate WebP + responsive variants.
- `npm run lint` — runs ESLint across the repo.
- `npm run preview` — preview the production build.
### Linting and Code Quality
ESLint is configured for TypeScript files to maintain code quality.
```bash
npm run lint
```

### Asset Management
- **Branding Assets**: If branding assets in `Buisiness-Branding-Elements/` are modified, `process_assets.py` should be run to update derived assets.
- **Image Optimization**: New or updated images in `public/assets/images/` should be processed using `scripts/optimize-images.js`.

Notes and commands for asset pipelines:

```bash
# Python asset processing (creates ./processed_assets/catalog.json)
python Buisiness-Branding-Elements/process_assets.py

# Node image optimization (required before `build:prod`)
npm run optimize:images
```

### Component Development
New React components should be created in `src/components/` and adhere to the existing functional component pattern using hooks.

## 3. Project-Specific Conventions and Patterns

- **React Component Structure**: Components are typically functional, leverage React hooks (e.g., `useState`, `useEffect`, custom hooks from `src/hooks/`), and are designed for reusability.
- **Styling**:
    - Global styles are defined in `src/App.css` and `src/index.css`.
    - Brand-specific theming is managed via CSS variables defined in `Buisiness-Branding-Elements/dashboard_assets/css/brand_theme.css`. Components should utilize these CSS variables for consistent branding.
- **Data Fetching**: Asynchronous data fetching from local JSON files (e.g., `dashboard_data.json`) is common. Example:
    ```javascript
    fetch('assets/dashboard_data.json')
      .then(response => response.json())
      .then(data => {
          // Process and update UI with data
      });
    ```

Minimal component example — where to add a new widget (`src/components/MyWidget.tsx`):

```tsx
import React from 'react'

export default function MyWidget() {
    return <div className="my-widget">...existing code...</div>
}
```

Minimal data-loading example (inside a component):

```tsx
useEffect(() => {
    fetch('/Buisiness-Branding-Elements/dashboard_assets/dashboard_data.json')
        .then(r => r.json())
        .then(setData)
}, [])
```
- **Modularity**: Logic is highly modularized into `src/context/`, `src/hooks/`, `src/store/`, and `src/utils/` to promote separation of concerns and reusability.

## 4. Key Files and Directories

- `src/`: Main source code for the React application.
- `src/components/`: Core UI building blocks.
- `src/store/`: Application-wide state management.
- `src/utils/`: Common utility functions and helpers.
- `Buisiness-Branding-Elements/dashboard_assets/`: Branding assets and dashboard-specific data.
- `Business-documents/`: Repository for business data and compliance documents.
- `scripts/`: Project-specific scripts (e.g., optimization, processing).
- `package.json`: Project dependencies and scripts.
- `tsconfig.json`: TypeScript configuration.
- `vite.config.ts`: Vite build configuration.
- `eslint.config.js`: ESLint configuration.

---

## 5. Runtime & environment notes

- Node: recommended 18+ for Vite, TypeScript, and `sharp` native bindings.
- Python: required to run `process_assets.py` (recommend Python 3.10+).
- Native modules: `sharp` is used by `scripts/optimize-images.js`; on Windows it may need prebuilt binaries. If `npm run optimize:images` fails, run:

```bash
npm install --save-dev sharp
```

- There is no `requirements.txt` in repo; consider installing:

```text
# requirements.txt
Pillow>=10.0.0
colorthief>=0.2.1
```

(See repository root for a generated `requirements.txt` suggestion.)

## 6. Repository quirks and cautions

- The folder name `Buisiness-Branding-Elements` is used by scripts (note the spelling). Do not rename it without updating script paths.
- `build:prod` runs the image optimization step; changing the images pipeline can change production output.

## 7. Quick checklist for common tasks

- Add a component: create `src/components/<Name>.tsx`, export default a functional component.
- Change branding assets: update files in `Buisiness-Branding-Elements/`, run `python Buisiness-Branding-Elements/process_assets.py`, then `npm run optimize:images`.
- Run full production build: `npm run build:prod`.

---

If you'd like, I can add the `requirements.txt` file to the repo with the two Python dependencies listed above.
