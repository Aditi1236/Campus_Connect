// Reusable form for reporting AND editing items.
// Props:
//   type          "lost" | "found"
//   initialValues existing item values (when editing)
//   onSubmit      function(FormData) - called with a ready-to-send FormData object
//   submitLabel   text of the submit button
//   loading       disables the button while saving
//   existingImage URL of the current image (when editing)
import { useState } from 'react';
import { CATEGORIES } from '../constants';
import { today } from '../utils';

const MAX_SIZE = 5 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ItemForm({ type, initialValues = {}, onSubmit, submitLabel, loading, existingImage }) {
  const isLost = type === 'lost';
  const [form, setForm] = useState({
    itemName: initialValues.itemName || '',
    category: initialValues.category || '',
    description: initialValues.description || '',
    location: initialValues.location || '',
    date: initialValues.date || '',
    additionalDetails: initialValues.additionalDetails || '',
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(existingImage || '');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (!TYPES.includes(selected.type)) {
      setErrors({ ...errors, image: 'Only JPG, PNG or WEBP images are allowed.' });
      e.target.value = '';
      return;
    }
    if (selected.size > MAX_SIZE) {
      setErrors({ ...errors, image: 'Image must be smaller than 5 MB.' });
      e.target.value = '';
      return;
    }
    setErrors({ ...errors, image: '' });
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const validate = () => {
    const e = {};
    if (form.itemName.trim().length < 2) e.itemName = 'Enter the item name.';
    if (!form.category) e.category = 'Choose a category.';
    if (form.description.trim().length < 10) e.description = 'Describe the item in at least 10 characters.';
    if (!form.location.trim()) e.location = isLost ? 'Where did you last see it?' : 'Where did you find it?';
    if (!form.date) e.date = 'Choose a date.';
    else if (form.date > today()) e.date = 'Date cannot be in the future.';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    data.append('itemType', type);
    if (file) data.append('image', file);
    onSubmit(data);
  };

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="itemName">Item name</label>
        <input id="itemName" name="itemName" value={form.itemName} onChange={handleChange} placeholder="e.g. Black HP laptop charger" maxLength={80} />
        {errors.itemName && <span className="field-error">{errors.itemName}</span>}
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={form.category} onChange={handleChange}>
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <span className="field-error">{errors.category}</span>}
        </div>
        <div className="field">
          <label htmlFor="date">{isLost ? 'Date lost' : 'Date found'}</label>
          <input id="date" type="date" name="date" max={today()} value={form.date} onChange={handleChange} />
          {errors.date && <span className="field-error">{errors.date}</span>}
        </div>
      </div>

      <div className="field">
        <label htmlFor="location">{isLost ? 'Last seen location' : 'Location where item was found'}</label>
        <input id="location" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Central library, 2nd floor" maxLength={120} />
        {errors.location && <span className="field-error">{errors.location}</span>}
      </div>

      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" rows="4" value={form.description} onChange={handleChange} placeholder="Colour, brand, size, condition..." maxLength={1000} />
        {errors.description && <span className="field-error">{errors.description}</span>}
      </div>

      <div className="field">
        <label htmlFor="additionalDetails">
          {isLost ? 'Additional identifying details' : 'Hidden identifying details'}
        </label>
        <textarea
          id="additionalDetails"
          name="additionalDetails"
          rows="3"
          value={form.additionalDetails}
          onChange={handleChange}
          maxLength={500}
          placeholder={isLost ? 'Scratches, stickers, serial number, contents...' : 'Something only the real owner would know (e.g. wallpaper, contents, marks)'}
        />
        <span className="hint">
          {isLost
            ? 'Only you and administrators can see this.'
            : 'Kept private. Administrators use it to verify the real owner, so it is never shown publicly.'}
        </span>
      </div>

      <div className="field">
        <label htmlFor="image">Photograph (optional)</label>
        <input id="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} />
        <span className="hint">JPG, PNG or WEBP, up to 5 MB.</span>
        {errors.image && <span className="field-error">{errors.image}</span>}
        {preview && <img className="upload-preview" src={preview} alt="Selected item preview" />}
      </div>

      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
