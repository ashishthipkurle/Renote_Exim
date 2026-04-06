import sys

path = r'd:\Job\Ranote_exim\Ranote_exim_2\client\app\dashboard\exporter\analytics\ExporterAnalyticsDashboard.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the first conflict block (Payment breakdown) - already done partially? No, let's verify.
# Actually, the previous multi-replace for chunk 0 succeeded.
# Let's check if the status markers are still there for the second block.

# Fixing the second block:
bad_block = """                  {[
 
                    { label: "Delivered", count: data.orderStatusBreakdown.DELIVERED, color: "#ffffff", icon: CheckCircle2 },
                    { label: "Shipped", count: data.orderStatusBreakdown.SHIPPED, color: "#e5e5e5", icon: Truck },
                    { label: "Processing", count: data.orderStatusBreakdown.PROCESSING, color: "#a3a3a3", icon: RefreshCw },
                    { label: "Confirmed", count: data.orderStatusBreakdown.CONFIRMED, color: "#737373", icon: CheckCircle2 },
                    { label: "Pending", count: data.orderStatusBreakdown.PENDING, color: "#525252", icon: Clock },
                    { label: "Cancelled", count: data.orderStatusBreakdown.CANCELLED, color: "#262626", icon: XCircle },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-3">
                      <s.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: s.color }} />
                      <span className="text-xs text-muted-foreground w-20 flex-shrink-0">{s.label}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${data.totalOrders > 0 ? (s.count / data.totalOrders) * 100 : 0}%`,
                            background: `linear-gradient(90deg, ${s.color}, ${s.color}60)`,
                            boxShadow: s.count > 0 ? `0 0 8px ${s.color}50` : "none",
                          }}
                        />
 
                      </div>
                    );
                  })}"""

good_block = """                  {[
                    { label: "Delivered", count: data.orderStatusBreakdown.DELIVERED, color: "#ffffff", icon: CheckCircle2 },
                    { label: "Shipped", count: data.orderStatusBreakdown.SHIPPED, color: "#e5e5e5", icon: Truck },
                    { label: "Processing", count: data.orderStatusBreakdown.PROCESSING, color: "#a3a3a3", icon: RefreshCw },
                    { label: "Confirmed", count: data.orderStatusBreakdown.CONFIRMED, color: "#737373", icon: CheckCircle2 },
                    { label: "Pending", count: data.orderStatusBreakdown.PENDING, color: "#525252", icon: Clock },
                    { label: "Cancelled", count: data.orderStatusBreakdown.CANCELLED, color: "#262626", icon: XCircle },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-3">
                      <s.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: s.color }} />
                      <span className="text-xs text-muted-foreground w-20 flex-shrink-0">{s.label}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${data.totalOrders > 0 ? (s.count / data.totalOrders) * 100 : 0}%`,
                            background: `linear-gradient(90deg, ${s.color}, ${s.color}60)`,
                            boxShadow: s.count > 0 ? `0 0 8px ${s.color}50` : "none",
                          }}
                        />
                      </div>
                      <span className="text-xs font-black text-foreground dark:text-white w-6 text-right flex-shrink-0">{s.count}</span>
                    </div>
                  ))}"""

# Loose matching by ignoring whitespace differences in the search
import re

def loose_replace(text, search, replacement):
    # Escape special characters but ignore whitespace
    # This is a bit complex, let's just use a simpler check for this exact file.
    if search in text:
        return text.replace(search, replacement)
    
    # Try with different line endings or slight whitespace variations
    search_alt = search.replace('\\n', '\\r\\n')
    if search_alt in text:
        return text.replace(search_alt, replacement)
        
    return None

new_content = loose_replace(content, bad_block, good_block)

if new_content:
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Success")
else:
    print("Failed to find block")
    # Let's try to find even smaller pieces
    if '<<<<<<< HEAD' in content:
        print("Found conflict markers still!")
    else:
        print("Conflict markers gone, but block mismatch.")
