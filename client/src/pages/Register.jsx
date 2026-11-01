import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../services/api';

export default function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', studentId: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Client-side validation (the server validates again for safety)
  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid college email.';
    if (!/^[A-Za-z0-9\-/]{3,20}$/.test(form.studentId)) e.studentId = 'Student ID: 3-20 letters, numbers, - or /.';
    if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(form.password)) e.password = 'At least 6 characters with a letter and a number.';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    setServerError('');
    if (Object.keys(found).length) return;

    setLoading(true);
    try {
      await register(form);
      showToast('Account created. Welcome to FindIt!');
      navigate('/dashboard');
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="form-card auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Create your account</h1>
        <p className="muted">Use your college email so classmates can trust your reports.</p>
        {serverError && <div className="alert alert-error" role="alert">{serverError}</div>}

        <div className="field">
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" value={form.name} onChange={handleChange} autoComplete="name" />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>
        <div className="field">
          <label htmlFor="email">College email</label>
          <input id="email" type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>
        <div className="field">
          <label htmlFor="studentId">Student ID</label>
          <input id="studentId" name="studentId" value={form.studentId} onChange={handleChange} />
          {errors.studentId && <span className="field-error">{errors.studentId}</span>}
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" name="password" value={form.password} onChange={handleChange} autoComplete="new-password" />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>
          <div className="field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input id="confirmPassword" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" />
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </div>
        </div>

        <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</button>
        <p className="center muted">Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
