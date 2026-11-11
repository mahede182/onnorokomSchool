import { useId, useState } from 'react';
import { api } from '../../../api';
import { Alert } from '../../../components/Alert';
import { SHIFTS, buildClassName } from '../../../constants/shifts';

export function CreateClassForm({ onCreated }) {
  const nameId = useId();
  const shiftId = useId();
  const seatsId = useId();
  const alertId = useId();
  const [name, setName] = useState('');
  const [shift, setShift] = useState(SHIFTS[0].value);
  const [seats, setSeats] = useState('');
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState(null);
  const [createMsgType, setCreateMsgType] = useState('error');
  const [nameInvalid, setNameInvalid] = useState(false);
  const [shiftInvalid, setShiftInvalid] = useState(false);
  const [seatsInvalid, setSeatsInvalid] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateMsg(null);

    const trimmed = name.trim();
    const seatCount = parseInt(seats, 10);
    const badName = !trimmed;
    const badShift = !shift;
    const badSeats = !seats || Number.isNaN(seatCount) || seatCount <= 0;
    setNameInvalid(badName);
    setShiftInvalid(badShift);
    setSeatsInvalid(badSeats);

    if (badName || badShift || badSeats) {
      setCreateMsg('Provide a class name, shift, and valid seat count.');
      setCreateMsgType('error');
      const first = badName
        ? document.getElementById(nameId)
        : badShift
          ? document.getElementById(shiftId)
          : document.getElementById(seatsId);
      first?.focus();
      return;
    }

    const fullName = buildClassName(trimmed, shift);
    setCreating(true);
    try {
      await api.createClass(fullName, seatCount);
      setCreateMsg(`Class "${fullName}" created!`);
      setCreateMsgType('success');
      setName('');
      setSeats('');
      setNameInvalid(false);
      setShiftInvalid(false);
      setSeatsInvalid(false);
      onCreated?.();
    } catch (err) {
      setCreateMsg(err.error || 'Failed to create class.');
      setCreateMsgType('error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="card" aria-labelledby="create-class-heading">
      <div className="card-header-row">
        <div>
          <span className="tag">Create</span>
          <h2 id="create-class-heading" className="mt-1">
            Create Class
          </h2>
          <p className="text-muted">
            Pick Morning or Night shift — each becomes a separate class.
          </p>
        </div>
      </div>
      <form onSubmit={handleCreate} noValidate>
        <div className="row">
          <div className="col">
            <label htmlFor={nameId}>Class Name</label>
            <input
              id={nameId}
              name="className"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Class 6"
              aria-invalid={nameInvalid || undefined}
              aria-describedby={createMsg ? alertId : undefined}
              autoComplete="off"
            />
          </div>
          <div className="col" style={{ maxWidth: 220 }}>
            <label htmlFor={shiftId}>Shift</label>
            <select
              id={shiftId}
              name="shift"
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              aria-invalid={shiftInvalid || undefined}
            >
              {SHIFTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col" style={{ maxWidth: 140 }}>
            <label htmlFor={seatsId}>Seat Count</label>
            <input
              id={seatsId}
              name="totalSeats"
              type="number"
              min={1}
              value={seats}
              onChange={(e) => setSeats(e.target.value)}
              placeholder="e.g. 40"
              aria-invalid={seatsInvalid || undefined}
              inputMode="numeric"
            />
          </div>
        </div>
        <Alert id={alertId} msg={createMsg} type={createMsgType} />
        <button className="btn-primary mt-2" type="submit" disabled={creating}>
          {creating ? 'Creating…' : 'Create Class'}
        </button>
      </form>
    </section>
  );
}
