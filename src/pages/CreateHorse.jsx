// src/pages/CreateHorse.jsx
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentUser } from "../lib/auth";
import { api } from "../lib/api";
import "../styles/createHorse.css";

const API_PREFIX = "/api";

export default function CreateHorse() {
  const navigate = useNavigate();
  const { stableId } = useParams();

  const user = useMemo(() => {
    try {
      return getCurrentUser() || null;
    } catch {
      return null;
    }
  }, []);

  const [form, setForm] = useState({
    name: "",
    birthday: "",
    age: "",
    temperament: "",
    breed: "",
    notes: "",
    sex: "",
  });

  const [likes, setLikes] = useState([]);
  const [dislikes, setDislikes] = useState([]);
  const [likeInput, setLikeInput] = useState("");
  const [dislikeInput, setDislikeInput] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <main className="page page--narrow">
        <h1>Add a Horse</h1>
        <p>Please sign in to add a horse.</p>
      </main>
    );
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addLike() {
    const trimmed = likeInput.trim();
    if (!trimmed) return;
    if (!likes.includes(trimmed)) {
      setLikes((prev) => [...prev, trimmed]);
    }
    setLikeInput("");
  }

  function addDislike() {
    const trimmed = dislikeInput.trim();
    if (!trimmed) return;
    if (!dislikes.includes(trimmed)) {
      setDislikes((prev) => [...prev, trimmed]);
    }
    setDislikeInput("");
  }

  function removeLike(item) {
    setLikes((prev) => prev.filter((v) => v !== item));
  }

  function removeDislike(item) {
    setDislikes((prev) => prev.filter((v) => v !== item));
  }

  function handleImageChange(e) {
    const file = e.target.files && e.target.files[0];
    setImageFile(file || null);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview("");
    }
  }


  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const trimmedName = form.name.trim();
    if (!trimmedName) {
      setError("Horse name is required.");
      return;
    }

    if (!form.birthday) {
      setError("Birthday is required.");
      return;
    }

    const ownerId = user?.UserID;
    if (!ownerId || ownerId <= 0) {
      setError("Missing owner. Please sign in again.");
      return;
    }

    const payload = {
      Name: trimmedName,
      DOB: form.birthday,
      Temperament: form.temperament.trim() || null,
      Sex: form.sex ? form.sex.toLowerCase() : null,
      OwnerID: ownerId,
    };

    setSubmitting(true);
    try {
      const path = stableId
        ? `${API_PREFIX}/stables/${stableId}/horses`
        : `${API_PREFIX}/users/${user.UserID}/horses`;

      await api(path, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (stableId) {
        navigate(`/stables/${stableId}/horses`);
      } else {
        navigate("/profile");
      }
    } catch (err) {
      setError(err?.message || "Unable to create horse.");
    } finally {
      setSubmitting(false);
    }
  }


  return (
    <main className="add-horse-container">
      <div className="add-horse-inner">
        <h1>Add a Horse</h1>
        {stableId && <p className="form-subtitle">Adding to stable #{stableId}</p>}

        {error && <div className="form-error">{error}</div>}

        <form className="card form horse-form" onSubmit={handleSubmit}>
          <div className="horse-layout">
            <div className="horse-left">
              <section className="form-section">
                <h2 className="section-title">Photo</h2>

                <div className="image-upload">
                  <div className="image-drop">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Horse preview" />
                    ) : (
                      <span className="image-placeholder-text">
                        Add a photo to help riders recognize this horse
                      </span>
                    )}
                  </div>

                  <label
                    htmlFor="horse-image"
                    className="custom-upload-button"
                  >
                    Choose photo
                  </label>
                  <input
                    id="horse-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden-file-input"
                  />

                  <p className="field-help">JPG or PNG, up to 10MB.</p>
                </div>
              </section>

              <section className="form-section">
                <div className="field">
                  <label htmlFor="horse-name">My name is...</label>
                  <input
                    id="horse-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    required
                    placeholder="Enter horse's name..."
                  />
                </div>
              </section>
            </div>

            <div className="horse-right">
              <section className="form-section">
                <h2 className="section-title">Basic info</h2>

                <div className="field-inline">
                  <div className="field">
                    <label htmlFor="horse-birthday">My Birthday is...</label>
                    <input
                      id="horse-birthday"
                      type="date"
                      value={form.birthday}
                      onChange={(e) => updateField("birthday", e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="horse-age">I am </label>
                    <input
                      id="horse-age"
                      type="number"
                      min="0"
                      value={form.age}
                      onChange={(e) => updateField("age", e.target.value)}
                      placeholder="years old..."
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="horse-breed">I am a...</label>
                  <input
                    id="horse-breed"
                    type="text"
                    value={form.breed}
                    onChange={(e) => updateField("breed", e.target.value)}
                    placeholder="Enter breed..."
                  />
                </div>

                <div className="field">
                  <label htmlFor="horse-sex">Sex</label>
                  <select
                    id="horse-sex"
                    value={form.sex}
                    onChange={(e) => updateField("sex", e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="mare">Mare</option>
                    <option value="gelding">Gelding</option>
                    <option value="stallion">Stallion</option>
                    <option value="filly">Filly</option>
                    <option value="colt">Colt</option>
                  </select>
                </div>
              </section>

              <section className="form-section">
                <h2 className="section-title">Personality</h2>

                <div className="field">
                  <label htmlFor="horse-temperament">Temperament</label>
                  <input
                    id="horse-temperament"
                    type="text"
                    placeholder="Ex: Gentle, bold, etc..."
                    value={form.temperament}
                    onChange={(e) =>
                      updateField("temperament", e.target.value)
                    }
                  />
                </div>
              </section>

              <section className="form-section form-section--split">
                <div className="form-subsection">
                  <h3 className="section-subtitle">Likes</h3>
                  <div className="field">
                    <div className="tag-input-row">
                      <input
                        type="text"
                        value={likeInput}
                        onChange={(e) => setLikeInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addLike();
                          }
                        }}
                        placeholder="Ex: Carrots, trail rides, etc."
                      />
                      <button
                        type="button"
                        className="custom-upload-button"
                        onClick={addLike}
                      >
                        +
                      </button>
                    </div>
                    {likes.length > 0 && (
                      <ul className="tag-list">
                        {likes.map((item) => (
                          <li key={item} className="tag-pill">
                            <span>{item}</span>
                            <button
                              type="button"
                              className="tag-remove"
                              onClick={() => removeLike(item)}
                            >
                              x
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="form-subsection">
                  <h3 className="section-subtitle">Dislikes</h3>
                  <div className="field">
                    <div className="tag-input-row">
                      <input
                        type="text"
                        value={dislikeInput}
                        onChange={(e) => setDislikeInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addDislike();
                          }
                        }}
                        placeholder="Ex: Loud noises, fly spray, etc."
                      />
                      <button
                        type="button"
                        className="custom-upload-button"
                        onClick={addDislike}
                      >
                        +
                      </button>
                    </div>
                    {dislikes.length > 0 && (
                      <ul className="tag-list">
                        {dislikes.map((item) => (
                          <li key={item} className="tag-pill">
                            <span>{item}</span>
                            <button
                              type="button"
                              className="tag-remove"
                              onClick={() => removeDislike(item)}
                            >
                              x
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </section>

              <section className="form-section">
                <h2 className="section-title">Notes</h2>
                <div className="field field--wide">
                  <textarea
                    id="horse-notes"
                    rows={4}
                    value={form.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    placeholder="Any additional information you'd want people to know about this horse..."
                  />
                </div>
              </section>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(-1)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save horse"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
