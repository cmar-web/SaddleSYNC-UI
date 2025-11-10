import React from "react";
import "../styles/createHorse.css";

export default function CreateHorse() {
  return (
    <main className="horse-create">
      <div className="horse-grid">

        <section className="panel photo-panel">
          <div className="photo-drop">
            <input type="file" id="photo-input" accept="image/*" />
            <label htmlFor="photo-input" className="photo-prompt">
              Add a photo
            </label>
          </div>
        </section>

        <section className="panel">
          <label className="label" htmlFor="temperament">Temperament</label>
          <input id="temperament" className="input" placeholder="Ex: timid, social, friendly..." />
        </section>

        <section className="panel list-panel">
          <div className="list-head">
            <span>Likes</span>
          </div>
          <div className="list-body">
            <input className="input" placeholder="Ex: apples" />
          </div>
          <div className="list-actions">
            <button type="button" className="btn icon add">+</button>
            <button type="button" className="btn icon del">🗑</button>
          </div>
        </section>

        <section className="panel list-panel">
          <div className="list-head">
            <span>Dislikes</span>
          </div>
          <div className="list-body">
            <input className="input" placeholder="Ex: loud noises" />
          </div>
          <div className="list-actions">
            <button type="button" className="btn icon add">+</button>
            <button type="button" className="btn icon del">🗑</button>
          </div>
        </section>

        <section className="panel">
          <label className="label" htmlFor="name">Hi, my name is...</label>
          <input id="name" className="input" placeholder="Enter horse’s name..." />
          <label className="label mt" htmlFor="age">I am...</label>
          <input id="age" className="input" placeholder="years old" />
        </section>

        <section className="panel">
          <label className="label" htmlFor="birthday">My birthday is...</label>
          <div className="date-row">
            <input id="birthday" className="input" type="date" />
          </div>
        </section>

        <section className="panel notes-panel">
          <label className="label" htmlFor="notes">Any special accommodations or notes</label>
          <textarea id="notes" className="textarea" rows="4" placeholder="Ex: Needs meds at 9:00 am before grazing" />
        </section>

        <div className="actions">
          <button className="btn-brown">Add horse profile</button>
        </div>
      </div>
    </main>
  );
}
