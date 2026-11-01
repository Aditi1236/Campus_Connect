// Colored pill for statuses (active, claimed, resolved, closed, pending, approved, rejected) and item type
export default function StatusBadge({ value, type }) {
  if (!value) return null;
  return <span className={`badge badge-${value} ${type || ''}`}>{value}</span>;
}
