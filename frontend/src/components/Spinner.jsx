export function Spinner({ label = 'Loading' }) {
  return (
    <div className="spinner" role="status" aria-live="polite" aria-busy="true">
      <span className="visually-hidden">{label}</span>
    </div>
  );
}
