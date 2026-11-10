import { useState, useEffect, useCallback } from 'react';
import { api } from './api';

// ─── Badge component ──────────────────────────────────────────────
function Badge({ status }) {
  const cls = `badge badge-${status.toLowerCase()}`;
  return <span className={cls}>{status}</span>;
}

// ─── Alert component ──────────────────────────────────────────────
function Alert({ msg, type }) {
  if (!msg) return null;
  return <div className={`alert alert-${type}`}>{msg}</div>;
}

// ─── Class Cards ──────────────────────────────────────────────────
function ClassCard({ cls, studentId, onHeld }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [msgType, setMsgType] = useState('error');

  const pct = cls.totalSeats > 0
    ? Math.round(((cls.heldSeats + cls.confirmedSeats) / cls.totalSeats) * 100)
    : 0;

  const handleHold = async () => {
    setMsg(null);
    if (!studentId) {
      setMsg('Enter your 17-digit Student ID first (top of page).');
      setMsgType('error');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.createHold(cls.id, studentId);
      setMsg(`Hold created! Expires: ${new Date(data.expiresAt).toLocaleTimeString()}`);
      setMsgType('success');
      onHeld?.();
    } catch (e) {
      setMsg(e.error || 'Failed to create hold.');
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="class-card">
      <h3>{cls.name}</h3>
      <div className="seat-bar mt-1">
        <div className="seat-bar-inner" style={{ width: `${pct}%` }} />
      </div>
      <div className="seat-stats">
        <span>✅ {cls.confirmedSeats} confirmed</span>
        <span>⏳ {cls.heldSeats} held</span>
        <span>🪑 {cls.availableSeats} free</span>
      </div>
      {msg && <Alert msg={msg} type={msgType} />}
      <button
        className="btn-primary"
        onClick={handleHold}
        disabled={loading || cls.availableSeats === 0}
      >
        {loading ? 'Holding…' : cls.availableSeats === 0 ? 'Full' : 'Hold a Seat'}
      </button>
    </div>
  );
}

// ─── Classes Page ─────────────────────────────────────────────────
function ClassesPage({ studentId }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [seats, setSeats] = useState('');
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState(null);
  const [createMsgType, setCreateMsgType] = useState('error');

  const load = useCallback(async () => {
    try {
      const { data } = await api.getClasses();
      setClasses(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateMsg(null);
    if (!name.trim() || !seats || parseInt(seats) <= 0) {
      setCreateMsg('Provide a valid class name and number of seats.');
      setCreateMsgType('error');
      return;
    }
    setCreating(true);
    try {
      await api.createClass(name.trim(), parseInt(seats));
      setCreateMsg(`Class "${name.trim()}" created!`);
      setCreateMsgType('success');
      setName('');
      setSeats('');
      load();
    } catch (err) {
      setCreateMsg(err.error || 'Failed to create class.');
      setCreateMsgType('error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h2>Add New Class</h2>
        <form onSubmit={handleCreate}>
          <div className="row">
            <div className="col">
              <label>Class Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Class 6 – Science" />
            </div>
            <div className="col" style={{ maxWidth: 160 }}>
              <label>Total Seats</label>
              <input type="number" min={1} value={seats} onChange={e => setSeats(e.target.value)} placeholder="e.g. 40" />
            </div>
          </div>
          {createMsg && <Alert msg={createMsg} type={createMsgType} />}
          <button className="btn-primary mt-2" type="submit" disabled={creating}>
            {creating ? 'Creating…' : '+ Create Class'}
          </button>
        </form>
      </div>

      <h2>Available Classes</h2>
      {loading
        ? <div className="spinner" />
        : classes.length === 0
          ? <p className="text-muted">No classes yet. Create one above.</p>
          : <div className="class-grid">
              {classes.map(cls => (
                <ClassCard key={cls.id} cls={cls} studentId={studentId} onHeld={load} />
              ))}
            </div>
      }
    </div>
  );
}

// ─── My Applications Page ─────────────────────────────────────────
function MyApplicationsPage({ studentId }) {
  const [holds, setHolds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [msgType, setMsgType] = useState('error');

  const load = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setMsg(null);
    try {
      const { data } = await api.getMyHolds(studentId);
      setHolds(data);
    } catch (e) {
      setMsg(e.error || 'Failed to load applications.');
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  const handleConfirm = async (holdId) => {
    setMsg(null);
    try {
      await api.confirmHold(holdId, studentId);
      setMsg('Admission confirmed!');
      setMsgType('success');
      load();
    } catch (e) {
      setMsg(e.error || 'Could not confirm.');
      setMsgType('error');
    }
  };

  const handleCancel = async (holdId) => {
    setMsg(null);
    try {
      await api.cancelHold(holdId, studentId);
      setMsg('Hold cancelled.');
      setMsgType('success');
      load();
    } catch (e) {
      setMsg(e.error || 'Could not cancel.');
      setMsgType('error');
    }
  };

  if (!studentId) {
    return <p className="text-muted">Enter your 17-digit Student ID at the top to view applications.</p>;
  }

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h2 style={{ marginBottom: 0 }}>My Applications</h2>
          <button className="btn-secondary" onClick={load} disabled={loading}>↻ Refresh</button>
        </div>
        {msg && <Alert msg={msg} type={msgType} />}
        {loading
          ? <div className="spinner" />
          : holds.length === 0
            ? <p className="text-muted">No applications found.</p>
            : <table className="table">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Hold ID</th>
                    <th>Status</th>
                    <th>Expires</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {holds.map(h => (
                    <tr key={h.holdId}>
                      <td>{h.className}</td>
                      <td><code style={{ fontSize: '0.8rem' }}>{h.holdId}</code></td>
                      <td><Badge status={h.status} /></td>
                      <td className="text-sm">{new Date(h.expiresAt).toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          {h.status === 'HELD' && (
                            <>
                              <button className="btn-success" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }} onClick={() => handleConfirm(h.holdId)}>Confirm</button>
                              <button className="btn-danger" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }} onClick={() => handleCancel(h.holdId)}>Cancel</button>
                            </>
                          )}
                          {h.status === 'CONFIRMED' && <span className="text-sm">✅ Admitted</span>}
                          {(h.status === 'EXPIRED' || h.status === 'CANCELLED') && <span className="text-muted">—</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
        }
      </div>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState('classes');
  const [studentId, setStudentId] = useState('');

  return (
    <>
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1>🏫 School Admission System</h1>
            <p className="text-muted">Seat hold & confirmation portal</p>
          </div>
          <div style={{ minWidth: 240 }}>
            <label>Your Student ID (17 digits)</label>
            <input
              maxLength={17}
              value={studentId}
              onChange={e => setStudentId(e.target.value.replace(/\D/g, '').slice(0, 17))}
              placeholder="12345678901234567"
            />
          </div>
        </div>
      </div>

      <nav className="nav">
        <button className={`nav-btn${page === 'classes' ? ' active' : ''}`} onClick={() => setPage('classes')}>📚 Classes</button>
        <button className={`nav-btn${page === 'my' ? ' active' : ''}`} onClick={() => setPage('my')}>📋 My Applications</button>
      </nav>

      {page === 'classes' && <ClassesPage studentId={studentId} />}
      {page === 'my' && <MyApplicationsPage studentId={studentId} />}
    </>
  );
}
