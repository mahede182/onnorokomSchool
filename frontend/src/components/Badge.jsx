export function Badge({ status }) {
  const cls = `badge badge-${String(status).toLowerCase()}`;
  return <span className={cls}>{status}</span>;
}
