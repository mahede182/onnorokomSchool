import { useId, useState } from 'react';
import { api } from '../../../api';
import { Alert } from '../../../components/Alert';

export function CreateClassForm({ onCreated }) {
  const nameId = useId();
  const seatsId = useId();
  const alertId = useId();
  const [name, setName] = useState('');
  const [seats, setSeats] = useState('');
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState(null);
  const [createMsgType, setCreateMsgType] = useState('error');
  const [nameInvalid, setNameInvalid] = useState(false);
  const [seatsInvalid, setSeatsInvalid] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateMsg(null);

    const trimmed = name.trim();
    const seatCount = parseInt(seats, 10);
    const badName = !trimmed;
    const badSeats = !seats || Number.isNaN(seatCount) || seatCount <= 0;
    setNameInvalid(badName);
    setSeatsInvalid(badSeats);

    if (badName || badSeats) {
      setCreateMsg('Provide a valid class name and number of seats.');
      setCreateMsgType('error');
      const first = badName
        ? document.getElementById(nameId)
        : document.getElementById(seatsId);
      first?.focus();
      return;
    }

    setCreating(true);
    try {
      await api.createClass(trimmed, seatCount);
      setCreateMsg(`Class "${trimmed}" created!`);
      setCreateMsgType('success');
      setName('');
      setSeats('');
      setNameInvalid(false);
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
      <h2 id="create-class-heading">Add New Class</h2>
      <form onSubmit={handleCreate} noValidate>
        <div className="row">
          <div className="col">
            <label htmlFor={nameId}>Class Name</label>
            <input
              id={nameId}
              name="className"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Class 6 – Science"
              aria-invalid={nameInvalid || undefined}
              aria-describedby={createMsg ? alertId : undefined}
              autoComplete="off"
            />
          </div>
          <div className="col" style={{ maxWidth: 160 }}>
            <label htmlFor={seatsId}>Total Seats</label>
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
