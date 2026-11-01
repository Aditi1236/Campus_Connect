// Tiny helper functions used by several components.
export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

// "2026-11-01" for <input type="date">
export const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

export const today = () => new Date().toISOString().slice(0, 10);
