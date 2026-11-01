// Row of statistic cards. Props: stats = [{ label, value, tone }]
export default function DashboardStats({ stats }) {
  return (
    <div className="stats-grid">
      {stats.map((s) => (
        <div key={s.label} className={`stat-card tone-${s.tone || 'navy'}`}>
          <span className="stat-value">{s.value}</span>
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
