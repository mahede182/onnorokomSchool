export function Alert({ msg, type = 'error', id }) {
  if (!msg) return null;

  return (
    <div
      id={id}
      className={`alert alert-${type}`}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      {msg}
    </div>
  );
}
