import { Link } from "react-router-dom";
import "../styles/boarding.css";

export default function Boarding() {
  return (
    <div className="boarding-shell">
      <header className="boarding-header">
        <div className="brand-badge" />
      </header>

      <main className="booking-content">
        <section className="panel form-side">
          <h2>General Information</h2>

          <form className="booking-form" onSubmit={(e) => e.preventDefault()}>
            <div className="row two">
              <div className="field">
                <label>First Name</label>
                <input type="text" placeholder="First name" />
              </div>
              <div className="field">
                <label>Last Name</label>
                <input type="text" placeholder="Last name" />
              </div>
            </div>

            <div className="row two">
              <div className="field">
                <label>Phone Number</label>
                <input type="tel" placeholder="(xxx) xxx-xxxx" />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" placeholder="name@email.com" />
              </div>
            </div>

            <div className="row">
              <label className="label-inline">Select horse(s) that will be boarding</label>
              <div className="horse-select">
                <select>
                  <option>John</option>
                  <option>Johnathan</option>
                  <option>Denny</option>
                  <option>Johnny</option>
                </select>
                <button type="button" className="icon-btn">+</button>
              </div>
            </div>

            <div className="row">
              <label>Notes</label>
              <textarea rows={4} placeholder="If there are any additional comments or concerns, please list them below" />
            </div>
          </form>
        </section>

        <aside className="panel calendar-side">
          <div className="calendar-head">
            <h3>September · 2025</h3>
            <div className="cal-nav">
              <button type="button" aria-label="Prev" className="icon-btn">&lt;</button>
              <button type="button" aria-label="Next" className="icon-btn">&gt;</button>
            </div>
          </div>

          <div className="calendar">
            <div className="cal-days">
              <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
            </div>
            <div className="cal-grid">
              <span className="empty" />
              <span className="empty" />
              <span className="empty" />
              <span className="empty" />
              <span className="date">1</span>
              <span className="date">2</span>
              <span className="date">3</span>
              <span className="date">4</span>
              <span className="date">5</span>
              <span className="date">6</span>
              <span className="date">7</span>
              <span className="date selected">21</span>
              <span className="date range">22</span>
              <span className="date range">23</span>
              <span className="date range">24</span>
              <span className="date range">25</span>
              <span className="date">26</span>
              <span className="date">27</span>
              <span className="date">28</span>
              <span className="date">29</span>
              <span className="date">30</span>
            </div>
          </div>

          <p className="calendar-help">Select desired booking dates using calendar</p>

          <Link to="/billing" className="cta wide">Payment and Billing →</Link>
        </aside>
      </main>
    </div>
  );
}
