export default function EmptyState({ title = "No data yet", text = "Create a new record to get started." }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}
