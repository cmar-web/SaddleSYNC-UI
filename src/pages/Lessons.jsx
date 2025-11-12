import React from "react";
import "../styles/lessons.css";

export default function Lessons() {
  return (
    <main className="lesson">
      <div className="lesson__shell">
        {/* LEFT PANEL */}
        <section className="lesson__left">
          <header className="hero">
            <div className="hero__avatar" aria-hidden="true">
              {/* placeholder mark; swap for stables img l8r */}
              <div className="hero__mark">🟤</div>
            </div>
            <div className="hero__copy">
              <h1 className="hero__title">Ride with Us!</h1>
              <p className="hero__price">Private Lesson: $—</p>
              <p className="hero__price">Group Lesson: $—</p>
            </div>
          </header>

          <div className="card card--outline">
            <h2 className="card__title">General Information</h2>
            <p className="card__subtitle">Please fill in all provided fields</p>

            <div className="form-grid">
              <div className="field">
                <input type="text" placeholder="First Name" />
              </div>
              <div className="field">
                <input type="text" placeholder="Last Name" />
              </div>

              <div className="field">
                <input type="text" placeholder="Phone Number" />
              </div>
              <div className="field">
                <select>
                  <option>Experience level</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>

              <div className="field field--full">
                <input type="email" placeholder="Email" />
              </div>
            </div>

            <div className="gear">
              <label className="gear__check">
                <input type="checkbox" /> I will need gear
              </label>
              <p className="gear__hint">
                Not sure what you need? See our recommendations{" "}
                <a href="#">here</a>.
              </p>
            </div>

            <textarea
              className="notes"
              rows={3}
              placeholder="If there are any additional comments or concerns, please fill out the box below..."
            />

            <button className="btn btn--brown btn--sm">Release Form</button>
          </div>
        </section>

        {/* RIGHT PANEL */}
        <section className="lesson__right">
          <div className="calendar card">
            <div className="calendar__head">
              <span className="calendar__month">September</span>
              <span className="calendar__year">2025</span>
            </div>

            <div className="calendar__week">
              <span>Sun</span><span>Mon</span><span>Tue</span>
              <span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>

            {/* static shell to match the comp */}
            <div className="calendar__row">
              <div className="pill pill--active">21</div>
              <div className="pill">22</div>
              <div className="pill">23</div>
              <div className="pill">24</div>
              <div className="pill">25</div>
              <div className="pill">26</div>
              <div className="pill">27</div>
            </div>
          </div>

          <button className="btn btn--ghost">Select from calendar availability</button>

          <div className="options">
            <div className="option-card">
              <div className="option-card__head">Lesson Type</div>
              <div className="option-card__body">
                <button className="chip">Private</button>
                <button className="chip">Group</button>
              </div>
            </div>

            <div className="option-card">
              <div className="option-card__head">Lesson Style</div>
              <div className="option-card__body">
                <button className="chip">Western</button>
                <button className="chip">English</button>
              </div>
            </div>
          </div>

          <button className="btn btn--brown btn--lg">
            Payment and Billing →
          </button>
        </section>
      </div>
    </main>
  );
}
