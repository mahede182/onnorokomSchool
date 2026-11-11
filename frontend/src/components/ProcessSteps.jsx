const STEPS = [
  {
    num: '01',
    title: 'Enter ID',
    body: 'On Admissions, enter or Dev Generate your 17-digit birth registration number.',
  },
  {
    num: '02',
    title: 'Apply Now',
    body: 'Choose Morning or Night shift classes and hold a seat. Apply unlocks after your ID is set.',
  },
  {
    num: '03',
    title: 'Pay Fee',
    body: 'On My Applications, confirm with Pay Admission Fee before the countdown ends, or cancel.',
  },
];

export function ProcessSteps() {
  return (
    <section className="section" aria-labelledby="process-heading">
      <div className="section-intro">
        <span className="tag">Process</span>
        <h2 id="process-heading">Admission Process</h2>
        <p>
          A simple three-step path from inquiry to a confirmed seat — built for
          fairness under high demand.
        </p>
      </div>
      <div className="process-grid">
        {STEPS.map((step) => (
          <article key={step.num} className="process-step">
            <span className="process-num" aria-hidden="true">
              {step.num}
            </span>
            <div className="card">
              <h3>{step.title}</h3>
              <p className="text-muted mt-1">{step.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
