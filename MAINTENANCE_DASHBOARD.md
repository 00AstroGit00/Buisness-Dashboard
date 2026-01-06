# Maintenance & Update Dashboard Documentation

## Overview

The Maintenance Dashboard provides comprehensive system health monitoring, automated cleanup, update notifications, and growth metrics tracking for Deepa Restaurant & Tourist Home's digital infrastructure.

---

## 🔧 Features

### 1. Asset Cleanup Tool

**Identifies and removes duplicate backup files to save SSD space**

#### What It Does

- Scans `Business-documents/Backups/` folder for duplicate backups
- Identifies duplicates based on record counts (inventory, sales, expenses)
- Calculates space savings in MB
- Provides retention policy recommendations
- One-click cleanup with confirmation

#### Retention Policy

- **Last 30 days**: Keep all backups
- **31-90 days**: Keep weekly backups
- **91-365 days**: Keep monthly backups
- **Over 1 year**: Safe to delete

#### How to Use

1. Navigate to **Sidebar → Maintenance** (Admin only)
2. View "Asset Cleanup" section
3. Review duplicate count and space recoverable
4. Click "Clean Duplicates" button
5. Confirm deletion
6. Space freed up automatically!

#### Example Output

```
Total Backups: 45
Duplicates Found: 12
Space Recoverable: 18.5 MB

Recommendation: 12 duplicates detected. Cleanup recommended to free up 18.50 MB.
```

---

### 2. Auto-Updater

**Checks for dashboard updates and security patches**

#### What It Does

- Checks for new features, security patches, and bug fixes
- Displays update priority (Critical, High, Medium, Low)
- Shows release notes and descriptions
- Tracks last check timestamp
- Auto-checks every 24 hours

#### Update Types

- 🔴 **Security**: Critical security patches (immediate action)
- 🟠 **Feature**: New functionality and enhancements
- 🟡 **Bugfix**: Bug fixes and stability improvements
- 🔵 **Performance**: Speed and optimization updates

#### How to Use

1. Dashboard auto-checks on load (if 24h passed)
2. Or manually click "Check for Updates"
3. Review available updates
4. Click "View Release Notes" for details
5. Follow update instructions (if any)

#### Current Version

The dashboard tracks version `1.0.0` and will notify you of:

- New inventory forecasting features
- Enhanced security measures
- Performance optimizations
- UI/UX improvements

---

### 3. System Heartbeat

**Verifies localStorage data integrity every hour**

#### What It Checks

✅ **Inventory Integrity**: Valid product data, no NaN values  
✅ **Sales Data Integrity**: Valid amounts, no negative values  
✅ **Expenses Integrity**: Consistent expense records  
✅ **Store Hydration**: Zustand store loads correctly  
✅ **Storage Quota**: localStorage usage under 80%  

#### Health Status

- 🟢 **Healthy**: All checks passed, system running smoothly
- 🟡 **Warning**: 1-2 issues detected, review recommended
- 🔴 **Critical**: 3+ issues detected, immediate action required

#### Automatic Checks

- Runs **every hour** automatically
- Logs last 100 heartbeat results
- Tracks 24-hour uptime percentage
- Displays storage usage in MB

#### How to Use

1. View "System Heartbeat" section in Maintenance Dashboard
2. Check current status (Healthy/Warning/Critical)
3. Review 24-hour uptime percentage
4. Click "Run Check Now" for manual verification
5. Follow recommendations if issues detected

#### Example Issues & Fixes

| Issue | Recommendation |
|-------|----------------|
| Inventory data corrupted | Clear and re-import from Excel |
| Sales data invalid | Review entries in Accounting module |
| Storage quota exceeded | Run Asset Cleanup |
| Store hydration failed | Check browser console for errors |

---

### 4. Total Records Managed

**Tracks growth of Deepa's digital infrastructure**

#### Metrics Displayed

**Primary Metrics:**

- 🍷 **Pegs Sold**: Total liquor sales (60ml servings)
- 🏨 **Guests Checked-In**: Estimated from room revenue
- 💰 **Expenses Logged**: Total expense entries
- 📊 **Total Records**: All database entries combined

**Infrastructure Breakdown:**

- Inventory Items
- Sales Entries
- Expense Logs
- Transaction History

#### Growth Tracking

The dashboard automatically calculates:

- Total revenue across all categories
- Total expenses logged
- Number of unique inventory items
- Transaction count for audit trail

#### Example Display

```
Pegs Sold: 2,450
Guests Checked-In: 187
Expenses Logged: 342
Total Records: 3,156

Digital Infrastructure Growth:
- Inventory Items: 45
- Sales Entries: 89
- Expense Logs: 342
- Transactions: 2,680
```

---

## 📁 File Structure

### Utilities

```
src/utils/
├── assetCleanup.ts      # Backup duplicate detection & cleanup
├── autoUpdater.ts       # Update checking & version management
└── systemHeartbeat.ts   # Health checks & integrity verification
```

### Hooks

```
src/hooks/
└── useSystemHeartbeat.ts  # Automatic hourly health checks
```

### Components

```
src/components/
└── MaintenanceDashboard.tsx  # Main maintenance UI
```

---

## 🔄 Automatic Operations

### Hourly Heartbeat

```typescript
// Runs automatically every 60 minutes
✓ Check inventory data structure
✓ Validate sales amounts
✓ Verify expense records
✓ Monitor storage usage
✓ Log results to history
```

### Daily Update Check

```typescript
// Runs automatically every 24 hours
✓ Check for new versions
✓ Fetch release notes
✓ Cache update information
✓ Display notifications
```

---

## 🎯 Usage Scenarios

### Scenario 1: Running Low on SSD Space

1. Open Maintenance Dashboard
2. Check "Asset Cleanup" section
3. Note "Space Recoverable" amount
4. Click "Clean Duplicates"
5. Confirm deletion
6. **Result**: SSD space freed instantly!

### Scenario 2: System Running Slow

1. Check "System Heartbeat" status
2. Review storage usage
3. Look for "Critical" issues
4. Follow recommendations
5. Run manual health check
6. **Result**: Identify and fix performance bottlenecks!

### Scenario 3: Checking for Updates

1. Dashboard auto-checks on load
2. Or click "Check for Updates"
3. Review available updates
4. Note security patches (red badge)
5. Read release notes
6. **Result**: Stay up-to-date with latest features!

### Scenario 4: Tracking Business Growth

1. View "Total Records Managed"
2. See pegs sold, guests, expenses
3. Review infrastructure metrics
4. Track month-over-month growth
5. **Result**: Quantify digital transformation!

---

## 🛡️ Data Integrity

### What Gets Checked

The heartbeat verifies:

- No `NaN` (Not a Number) values in stock
- No negative amounts in sales/expenses
- All required fields present
- JSON structure is valid
- localStorage is accessible

### When Issues Are Detected

1. **Warning Status**: Review data, no immediate action
2. **Critical Status**: Follow recommendations immediately
3. **Auto-Logging**: All issues logged for audit
4. **Recommendations**: Specific fix instructions provided

---

## 📊 Performance Metrics

### Storage Monitoring

- **Used**: Current localStorage usage (KB/MB)
- **Quota**: Browser storage limit (typically 10MB)
- **Percentage**: Usage as % of quota
- **Warning**: Alert when over 80% used

### Uptime Tracking

- **24-Hour Uptime**: Percentage of healthy checks
- **Total Checks**: Number of heartbeats in 24h
- **Healthy**: Checks with no issues
- **Warnings**: Checks with minor issues
- **Critical**: Checks with major issues

---

## 🔐 Admin-Only Access

The Maintenance Dashboard is **Admin-only** for security:

- Accountants cannot access cleanup tools
- Prevents accidental data deletion
- Protects system integrity
- Maintains audit trail

---

## 🚀 Best Practices

### Daily

- ✅ Check system heartbeat status
- ✅ Review any warnings or issues
- ✅ Monitor storage usage

### Weekly

- ✅ Run asset cleanup if duplicates > 5
- ✅ Review growth metrics
- ✅ Check for available updates

### Monthly

- ✅ Verify 30-day uptime percentage
- ✅ Review backup retention policy
- ✅ Clean up old backups (>1 year)

---

## 🐛 Troubleshooting

### Issue: Heartbeat Shows "Critical"

**Solution:**

1. Check specific failed checks
2. Follow provided recommendations
3. Run manual check after fixes
4. Contact support if persists

### Issue: Cleanup Not Freeing Space

**Solution:**

1. Verify duplicates exist
2. Check browser permissions
3. Clear browser cache
4. Restart browser and retry

### Issue: Updates Not Showing

**Solution:**

1. Check internet connection
2. Manually click "Check for Updates"
3. Clear localStorage cache
4. Verify Git repository access

### Issue: Storage Quota Warning

**Solution:**

1. Run Asset Cleanup immediately
2. Export old data to Excel
3. Clear unnecessary backups
4. Consider archiving old records

---

## 📈 Growth Metrics Explained

### Pegs Sold

- Calculated from transaction history
- Each peg = 60ml of liquor
- Tracks bar sales performance
- Useful for inventory forecasting

### Guests Checked-In

- Estimated from room revenue
- Assumes ₹1,000 average per room
- Tracks hotel occupancy
- Useful for staffing decisions

### Expenses Logged

- Count of expense entries
- Tracks operational costs
- Useful for budget planning
- Shows accounting activity

### Total Records

- Sum of all database entries
- Inventory + Sales + Expenses + Transactions
- Measures digital infrastructure growth
- Demonstrates system usage

---

## 🎨 UI Features

### Color Coding

- 🟢 **Green**: Healthy, good status
- 🟡 **Yellow**: Warning, review needed
- 🔴 **Red**: Critical, action required
- 🔵 **Blue**: Informational

### Touch Optimization

- Large buttons for Samsung S23 Ultra
- Min 44px touch targets
- Swipe-friendly on MI Pad 7
- Responsive grid layouts

### Real-Time Updates

- Auto-refresh every minute
- Live storage monitoring
- Instant status changes
- No page reload needed

---

## 🔮 Future Enhancements

Planned features:

- [ ] Automated backup compression
- [ ] Cloud sync integration
- [ ] Email alerts for critical issues
- [ ] Advanced analytics dashboard
- [ ] Predictive maintenance alerts
- [ ] Performance benchmarking

---

## 📞 Support

For issues or questions:

1. Check this documentation first
2. Review heartbeat recommendations
3. Run manual health check
4. Check browser console for errors
5. Contact system administrator

---

## 🎯 Quick Reference

| Feature | Frequency | Action Required |
|---------|-----------|-----------------|
| Heartbeat | Every hour | Auto (review if issues) |
| Update Check | Every 24h | Auto (review updates) |
| Asset Cleanup | As needed | Manual (when duplicates > 5) |
| Growth Metrics | Real-time | View only |

**Access**: Sidebar → Maintenance (Admin only)

**Keyboard Shortcuts**: None (use mouse/touch)

**Mobile**: Fully optimized for Samsung S23 Ultra & MI Pad 7

---

Your Deepa Hotel Dashboard now has **enterprise-grade maintenance tools** to keep your system running smoothly! 🛠️✨
