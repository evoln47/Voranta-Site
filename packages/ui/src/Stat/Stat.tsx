export interface StatProps {
  value: string;
  label: string;
  accent?: boolean;
  className?: string;
}

export function Stat({ value, label, accent = false, className = '' }: StatProps) {
  const valueCls = ['stat-value', accent ? 'stat-value-accent' : ''].filter(Boolean).join(' ');
  return (
    <div className={['stat', className].filter(Boolean).join(' ')}>
      <div className={valueCls}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
