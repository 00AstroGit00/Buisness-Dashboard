# Deepa Restaurant & Tourist Home - Management Dashboard

A comprehensive, mobile-optimized management dashboard built for Deepa Restaurant & Tourist Home in Cherpulassery, Palakkad.

## 🚀 Features

### Core Operations
*   **Dashboard Overview:** Real-time revenue vs. expense tracking and daily sales summaries.
*   **Inventory Management:** Track liquor stock with peg-level precision, automated wastage calculations, and low-stock alerts.
*   **Billing System:** Digital billing with receipt generation.
*   **Room Management:** Manage room occupancy and bookings.
*   **Accounting:** Track daily sales, expenses, and net profit.

### Compliance & Reporting
*   **Excise Report:** Generate daily transaction reports formatted for Kerala Excise compliance.
*   **End of Day Summary:** Automated daily closing reports with export options.
*   **Compliance Vault:** Digital storage for licenses, tax documents, and registration certificates with expiry tracking.

### Security & Privacy (New!)
*   **Biometric Login:** Secure login using **Fingerprint/WebAuthn** (optimized for Samsung S23 Ultra).
*   **Privacy Mode:** Blur sensitive financial figures (Revenue, Profit) when customers are nearby. Toggle via the eye icon.
*   **Emergency Lock:** Instant one-click dashboard lockdown across all devices.
*   **Security Log:** Audit trail of all login attempts and security events.
*   **Role-Based Access:** Distinct views for **Admin** (Full Access) and **Accountant** (Restricted Access).

### System Maintenance
*   **System Monitor:** Real-time tracking of RAM usage, battery status, and component render performance.
*   **Maintenance Dashboard:** Tools for asset cleanup (deduplication), auto-updates, and system health checks.
*   **Auto-Backup:** Automatic nightly backups of all local data to the `Documents/Backups` folder.

## 📱 Mobile Optimization
*   **Samsung S23 Ultra:** Large touch targets, fingerprint login, and optimized layouts.
*   **MI Pad 7:** Responsive grid layouts for tablet viewing.
*   **Lazy Loading:** Optimized for 8GB RAM devices to ensure fast load times (< 1.5s).

## 🛠️ Setup & Installation

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Start Development Server:**
    ```bash
    npm run dev
    ```

3.  **Build for Production:**
    ```bash
    npm run build
    ```

4.  **Preview Production Build:**
    ```bash
    npm run preview
    ```

## 🎨 Asset Management

Branding assets (logos, brochures) are processed via a Python pipeline.

1.  Place raw images in `Buisiness-Branding-Elements/`.
2.  Run the processing script:
    ```bash
    python Buisiness-Branding-Elements/process_assets.py
    ```
3.  Optimized assets are generated in `Buisiness-Branding-Elements/processed_assets/` and indexed in `catalog.json`.

## 📂 Directory Structure

*   `src/components/`: UI Components (Dashboard, Inventory, Billing, etc.)
*   `src/context/`: State management (Auth, PrivacyMode)
*   `src/utils/`: Helper functions (Calculations, PDF exports, Security)
*   `public/Business-documents/`: Compliance documents storage.
*   `Buisiness-Branding-Elements/`: Raw assets and processing scripts.

## 🔐 Default Credentials (Prototype)

*   **Admin PIN:** `1234`
*   **Accountant PIN:** `5678`

*Note: In a production environment, ensure these PINs are changed and the `AuthContext` is connected to a secure backend.*