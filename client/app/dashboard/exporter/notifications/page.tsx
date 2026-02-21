const notifications = [
  {
    type: "order",
    title: "New Order Received",
    desc: "Order #8845 from Global Logistics Co. — $24,500 for Electronics",
    time: "5 mins ago",
    read: false,
    dotColor: "bg-primary",
  },
  {
    type: "shipment",
    title: "Shipment Delivered",
    desc: "Shipment #1021 delivered to Hamburg, Germany successfully",
    time: "23 mins ago",
    read: false,
    dotColor: "bg-green-500",
  },
  {
    type: "alert",
    title: "Low Stock Alert",
    desc: "Steel Pipes inventory below threshold — only 12 units remaining",
    time: "1h ago",
    read: false,
    dotColor: "bg-red-500",
  },
  {
    type: "payment",
    title: "Payment Received",
    desc: "$12,450 payment confirmed from TechSolutions Ltd",
    time: "2h ago",
    read: true,
    dotColor: "bg-emerald-500",
  },
  {
    type: "customs",
    title: "Customs Clearance Complete",
    desc: "Shipment #992 cleared customs at Port of LA",
    time: "3h ago",
    read: true,
    dotColor: "bg-purple-500",
  },
  {
    type: "lead",
    title: "New Lead",
    desc: "Vietnam Industrial sent a quote request for Raw Materials",
    time: "4h ago",
    read: true,
    dotColor: "bg-[#00f0ff]",
  },
  {
    type: "system",
    title: "System Maintenance Scheduled",
    desc: "Scheduled downtime Sunday 2:00 AM – 4:00 AM EST",
    time: "6h ago",
    read: true,
    dotColor: "bg-slate-500",
  },
];

export default function NotificationsPage() {
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0a0c12] to-[#0a0c12]">
      <header className="flex-shrink-0 h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#0a0c12]/30 backdrop-blur-sm z-40">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            Notifications
            {unread > 0 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                {unread} Unread
              </span>
            )}
          </h1>
          <p className="text-slate-400 text-sm">Stay updated on orders, shipments, and alerts</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors">
            Mark all as read
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto space-y-3">
          {notifications.map((n, i) => (
            <div
              key={i}
              className={`flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 hover:border-primary/30 ${
                n.read
                  ? "bg-[#151c2a]/40 border-white/5 opacity-70"
                  : "bg-[#151c2a]/60 backdrop-blur-xl border-white/10 shadow-xl"
              }`}
            >
              <div className="mt-1.5 flex-shrink-0">
                <div className={`w-3 h-3 rounded-full ${n.dotColor} ${!n.read ? "shadow-[0_0_10px_currentColor]" : ""}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-sm font-bold ${n.read ? "text-slate-300" : "text-white"}`}>{n.title}</h3>
                  <span className="text-[10px] text-slate-500 flex-shrink-0 ml-4">{n.time}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{n.desc}</p>
              </div>
              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
