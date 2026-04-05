const STATUS_CONFIG = {
  READ:              { label: 'Read',               dot: '●' },
  CURRENTLY_READING: { label: 'Currently Reading',  dot: '●' },
  TO_READ:           { label: 'To Read',            dot: '●' },
  DNF:               { label: "Didn't Complete",    dot: '●' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.TO_READ;
  return (
    <span className={`status-badge ${status}`}>
      <span>{config.dot}</span>
      {config.label}
    </span>
  );
}
