export default function StatCard({ label, value, hint, tone = "blue" }) {
  return (
    <section className={`stat-card tone-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </section>
  );
}
