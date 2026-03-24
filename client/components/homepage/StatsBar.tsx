export default function StatsBar() {
  return (
    <section className="py-16 bg-background border-b border-border relative reveal-on-scroll active">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="text-center md:text-left border-r border-border last:border-0 pr-4 group hover:bg-muted p-4 rounded transition-colors">
          <h3 className="text-4xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">2.4M+</h3>
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Shipments Tracked</p>
        </div>
        <div className="text-center md:text-left border-r border-border last:border-0 pr-4 group hover:bg-muted p-4 rounded transition-colors">
          <h3 className="text-4xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">$85B</h3>
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Trade Volume</p>
        </div>
        <div className="text-center md:text-left border-r border-border last:border-0 pr-4 group hover:bg-muted p-4 rounded transition-colors">
          <h3 className="text-4xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">190+</h3>
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Countries Served</p>
        </div>
        <div className="text-center md:text-left pr-4 group hover:bg-muted p-4 rounded transition-colors">
          <h3 className="text-4xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">0.01s</h3>
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Data Latency</p>
        </div>
      </div>
    </section>
  );
}
