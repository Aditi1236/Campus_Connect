import { useEffect, useState } from 'react';
import { adminService, getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

export default function AdminUsers() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminService
      .users({ q })
      .then((res) => setUsers(res.data.users))
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  };
  // eslint-disable-next-line
  useEffect(load, [q]);

  const remove = async (user) => {
    if (!window.confirm(`Delete ${user.name}? Their listings and claims will be deleted too.`)) return;
    try {
      await adminService.deleteUser(user._id);
      showToast('User deleted');
      load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  return (
    <>
      <h1>Students and users</h1>
      <SearchBar value={searchText} onChange={setSearchText} onSubmit={() => setQ(searchText)} placeholder="Search by name, email or student ID" />
      {loading ? (
        <Loader />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>Student ID</th><th>Email</th><th>Role</th><th>Listings</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td data-label="Name"><strong>{u.name}</strong></td>
                  <td data-label="Student ID">{u.studentId}</td>
                  <td data-label="Email">{u.email}</td>
                  <td data-label="Role"><span className={`badge badge-${u.role === 'admin' ? 'claimed' : 'active'}`}>{u.role}</span></td>
                  <td data-label="Listings">{u.listingsCount}</td>
                  <td data-label="Joined">{formatDate(u.createdAt)}</td>
                  <td data-label="Actions">
                    {u.role === 'student' ? <button className="btn btn-danger btn-sm" onClick={() => remove(u)}>Delete</button> : <small className="muted">Protected</small>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
