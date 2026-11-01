import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService, getErrorMessage } from '../services/api';
import { formatDate } from '../utils';

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ name: user.name, studentId: user.studentId });
  const [profileError, setProfileError] = useState('');
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [saving, setSaving] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setSaving(true);
    try {
      const res = await authService.updateProfile(profile);
      setUser(res.data.user);
      showToast('Profile updated');
    } catch (err) {
      setProfileError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (passwords.newPassword !== passwords.confirm) return setPasswordError('New passwords do not match.');
    try {
      await authService.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      showToast('Password changed');
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setPasswordError(getErrorMessage(err));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="narrow">
      <h1>Profile</h1>

      <form className="form-card" onSubmit={saveProfile}>
        <h2>Your details</h2>
        {profileError && <div className="alert alert-error" role="alert">{profileError}</div>}
        <div className="field">
          <label htmlFor="p-name">Full name</label>
          <input id="p-name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor="p-id">Student ID</label>
            <input id="p-id" value={profile.studentId} onChange={(e) => setProfile({ ...profile, studentId: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="p-email">Email (cannot be changed)</label>
            <input id="p-email" value={user.email} disabled />
          </div>
        </div>
        <p className="muted small">Role: {user.role} - Member since {formatDate(user.createdAt)}</p>
        <button className="btn btn-primary" disabled={saving}>Save changes</button>
      </form>

      <form className="form-card" onSubmit={savePassword}>
        <h2>Change password</h2>
        {passwordError && <div className="alert alert-error" role="alert">{passwordError}</div>}
        <div className="field">
          <label htmlFor="cur">Current password</label>
          <input id="cur" type="password" autoComplete="current-password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor="new">New password</label>
            <input id="new" type="password" autoComplete="new-password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="conf">Confirm new password</label>
            <input id="conf" type="password" autoComplete="new-password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
          </div>
        </div>
        <button className="btn btn-primary">Update password</button>
      </form>

      <button className="btn btn-outline" onClick={handleLogout}>Log out</button>
    </div>
  );
}
