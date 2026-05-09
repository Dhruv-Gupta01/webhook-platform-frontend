import type { DeliveryStatus } from '../types'

const STATUS_STYLES: Record<string, { bg: string; fg: string; dot: string }> = {
  pending:   { bg: 'var(--warn-soft)',    fg: 'var(--warn-fg)',    dot: 'var(--warn)' },
  retrying:  { bg: 'var(--info-soft)',    fg: 'var(--info-fg)',    dot: 'var(--info)' },
  delivered: { bg: 'var(--success-soft)', fg: 'var(--success-fg)', dot: 'var(--success)' },
  failed:    { bg: 'var(--danger-soft)',  fg: 'var(--danger-fg)',  dot: 'var(--danger)' },
  active:    { bg: 'var(--success-soft)', fg: 'var(--success-fg)', dot: 'var(--success)' },
  cancelled: { bg: 'var(--surface-2)',    fg: 'var(--fg-3)',       dot: 'var(--fg-muted)' },
}

export default function StatusBadge({ status, withDot = true }: { status: DeliveryStatus | string; withDot?: boolean }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.pending
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 10px', borderRadius: 'var(--radius-full)',
      font: '500 11px var(--font-sans)',
      background: s.bg, color: s.fg,
      whiteSpace: 'nowrap',
    }}>
      {withDot && (
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      )}
      {status}
    </span>
  )
}
