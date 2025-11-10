import { Link } from "react-router-dom";
import "../styles/boarding.css";

export default function BoardingInfo() {
  return (
    <div className="boarding-shell">
      <header className="boarding-header">
        <div className="brand-badge" />
      </header>

      <main className="boarding-content">
        <section className="panel services">
          <h2>Boarding Services</h2>

          <div className="services-grid">
            <div className="services-col">
              <p className="muted">Our guarantee:</p>
              <div className="card">
                <h3>Stall Features</h3>
                <ul className="bullets">
                  <li>12×12 matted stalls</li>
                  <li>Automatic waterers</li>
                  <li>Daily Cleaning</li>
                  <li>Hay and grain included</li>
                </ul>
              </div>
            </div>

            <div className="services-col">
              <div className="card">
                <h3>Care</h3>
                <ul className="bullets">
                  <li>24/7 care</li>
                  <li>Supplement feeding</li>
                  <li>Daily turnout</li>
                  <li>Blanketing</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <aside className="panel pricing">
          <h2>Pricing</h2>
          <div className="deposit-pill">600$ deposit</div>
          <ul className="price-list">
            <li><span>Month to month:</span><b>850$/month</b></li>
            <li><span>&lt; 2 months:</span><b>800$/month</b></li>
            <li><span>&ge; 2 months &lt; 6 months:</span><b>700$/month</b></li>
            <li><span>&gt; 6 months:</span><b>600$/month</b></li>
          </ul>

          <Link to="/boarding" className="cta">Book Now</Link>
        </aside>
      </main>
    </div>
  );
}
