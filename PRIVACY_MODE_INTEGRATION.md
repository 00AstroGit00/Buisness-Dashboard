# Privacy Mode Integration Examples

## How to Protect Sensitive Numbers in Your Dashboard

Use the `<PrivateNumber>` component to blur revenue, profit, and other sensitive figures when Privacy Mode is active.

---

## 1. DashboardOverview Component

### Revenue Cards
```typescript
import PrivateNumber from './PrivateNumber';
import { formatCurrency } from '../utils/formatCurrency';

// Total Revenue Card
<div className="text-3xl font-bold text-forest-green">
  <PrivateNumber 
    value={totalRevenue}
    format={formatCurrency}
    className="font-bold"
  />
</div>

// Daily Sales
<div className="text-2xl font-semibold text-forest-green">
  <PrivateNumber 
    value={dailySales}
    format={formatCurrency}
  />
</div>
```

---

## 2. Accounting Component

### Net Profit Widget
```typescript
// Net Profit Display
<div className="text-4xl font-bold text-green-600">
  <PrivateNumber 
    value={netProfit}
    format={formatCurrency}
    className="text-4xl font-bold"
    alwaysBlur={true}  // Always blur profit, even when Privacy Mode is off
  />
</div>

// Revenue Breakdown
<div>
  <span className="text-sm text-forest-green/70">Room Rent:</span>
  <PrivateNumber 
    value={roomRevenue}
    format={formatCurrency}
    className="ml-2 font-medium"
  />
</div>
```

---

## 3. ProfitAnalytics Component

### Chart Tooltips
```typescript
// Custom Recharts Tooltip with Privacy
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-brushed-gold/20 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-forest-green">
          Revenue: <PrivateNumber value={payload[0].value} format={formatCurrency} />
        </p>
        <p className="text-sm font-medium text-red-600">
          Expenses: <PrivateNumber value={payload[1].value} format={formatCurrency} />
        </p>
      </div>
    );
  }
  return null;
};
```

---

## 4. BillingSystem Component

### Bill Total
```typescript
// Invoice Total
<div className="border-t-2 border-forest-green pt-4 mt-4">
  <div className="flex justify-between items-center">
    <span className="text-xl font-bold text-forest-green">Total:</span>
    <PrivateNumber 
      value={billTotal}
      format={formatCurrency}
      className="text-2xl font-bold text-brushed-gold"
      alwaysBlur={true}  // Always blur customer bills
    />
  </div>
</div>
```

---

## 5. EndOfDay Component

### Daily Closing Report
```typescript
// EOD Summary
<div className="grid grid-cols-3 gap-4">
  <div>
    <p className="text-sm text-forest-green/70">Total Sales</p>
    <PrivateNumber 
      value={totalSales}
      format={formatCurrency}
      className="text-lg font-bold text-forest-green"
    />
  </div>
  
  <div>
    <p className="text-sm text-forest-green/70">Total Expenses</p>
    <PrivateNumber 
      value={totalExpenses}
      format={formatCurrency}
      className="text-lg font-bold text-red-600"
    />
  </div>
  
  <div>
    <p className="text-sm text-forest-green/70">Net Profit</p>
    <PrivateNumber 
      value={netProfit}
      format={formatCurrency}
      className="text-lg font-bold text-green-600"
      alwaysBlur={true}
    />
  </div>
</div>
```

---

## 6. Inventory Component (Stock Values)

### Closing Stock Value
```typescript
// Product Stock Value
<td className="px-4 py-3 text-forest-green">
  <PrivateNumber 
    value={closingStockValue}
    format={formatCurrency}
    className="font-medium"
  />
</td>

// Total Inventory Value
<div className="text-right font-bold text-xl text-forest-green">
  Total Value: <PrivateNumber 
    value={totalInventoryValue}
    format={formatCurrency}
  />
</div>
```

---

## PrivateNumber Component API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number \| string` | **required** | The sensitive value to display |
| `format` | `(value) => string` | `String(value)` | Function to format the value |
| `className` | `string` | `''` | Additional CSS classes |
| `alwaysBlur` | `boolean` | `false` | Always blur, regardless of Privacy Mode |

### Examples

**Simple number with currency formatting:**
```typescript
<PrivateNumber 
  value={1500}
  format={formatCurrency}
/>
// Displays: ₹1,500 (blurred when Privacy Mode ON)
```

**Custom formatter:**
```typescript
<PrivateNumber 
  value={totalPegs}
  format={(v) => `${v} pegs sold`}
  className="text-sm"
/>
// Displays: "150 pegs sold" (blurred when Privacy Mode ON)
```

**Always blur (even when Privacy Mode OFF):**
```typescript
<PrivateNumber 
  value={bankBalance}
  format={formatCurrency}
  alwaysBlur={true}
/>
// Always blurred, hover to reveal
```

---

## How It Works

1. **Privacy Mode OFF** - Numbers display normally
2. **Privacy Mode ON** - Numbers are blurred with CSS `blur(8px)`
3. **Hover/Touch** - Temporarily reveals the number
4. **On Mobile** - Touch reveals for 2 seconds

---

## Visual Examples

### Before (Normal Display)
```
Total Revenue: ₹45,000
```

### After Privacy Mode (Blurred)
```
Total Revenue: ₹▓▓▓▓▓
```

### On Hover (Revealed)
```
Total Revenue: ₹45,000  👈 (mouse over)
```

---

## Complete Integration Checklist

- [ ] Wrap App.tsx with `<PrivacyModeProvider>`
- [ ] Add `<PrivacyModeToggle>` to mobile header
- [ ] Add `<PrivacyModeToggle>` to desktop sidebar
- [ ] Protect revenue numbers in DashboardOverview
- [ ] Protect profit in Accounting component
- [ ] Protect bill totals in BillingSystem
- [ ] Protect EOD report figures
- [ ] Protect chart tooltips in ProfitAnalytics
- [ ] Test hover/touch reveal on Samsung S23 Ultra
- [ ] Test toggle button functionality
- [ ] Verify blur persists across page reloads

---

## Tips & Best Practices

### When to Use Privacy Mode
✅ During peak business hours (check-ins/check-outs)  
✅ When customers are near the counter  
✅ When showing the dashboard to non-authorized staff  
✅ During training sessions for new employees  

### What to Protect
- 💰 Revenue figures (daily, monthly, total)
- 📊 Profit margins and net profit
- 💳 Customer bill amounts
- 🏦 Bank balances and cash on hand
- 📈 Sales forecasts and projections

### What NOT to Protect
- 📦 Inventory item names
- 👥 Employee names and roles
- 📅 Dates and timestamps
- 🏷️ Product categories
- 📋 General system information

---

## Mobile Optimization

### Samsung S23 Ultra
- Touch any blurred number
- Number reveals for 2 seconds
- Touch again to keep revealed
- Large touch targets (min 44px)

### MI Pad 7
- Hover works like desktop
- Touch also supported
- Optimized for landscape mode
- Multi-column layout shows more data

---

## Accessibility

Privacy Mode maintains accessibility:
- Screen readers announce actual values
- Keyboard navigation supported
- Focus indicators visible
- High contrast mode compatible

---

## Next Steps

1. Import `PrivateNumber` in your dashboard components
2. Wrap sensitive currency values
3. Test on your Samsung S23 Ultra
4. Train staff on Privacy Mode usage
5. Make it a standard practice during busy hours

**Privacy Mode helps maintain professional discretion while keeping your dashboard accessible when needed!** 🔒👁️

