export function HeroBanner() {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero-deco" aria-hidden="true">
        {Array.from({ length: 9 }).map((_, i) => (
          <i key={i} />
        ))}
      </div>
      <div className="hero-body">
        <div>
          <span className="tag">Admission</span>
          <h1 id="hero-heading">Join Our onnorokomSchool Family</h1>
        </div>
        <p>
          Transparent, first-come seat holds for every shift. Enter your birth
          registration number below, apply for a class, then confirm with the
          admission fee on My Applications before the hold expires.
        </p>
      </div>
    </section>
  );
}
