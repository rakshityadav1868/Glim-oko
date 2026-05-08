const MetricCard = ({ icon: Icon, title, value }) => (
  <div className="metric-card">
    <div className="metric-card-header">
      <Icon size={14} />
      <span className="mono">{title}</span>
    </div>
    <div className="metric-card-value">{value}</div>
  </div>
);

export default MetricCard;
