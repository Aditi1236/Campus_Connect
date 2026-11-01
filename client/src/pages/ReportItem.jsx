// One page component used by both ReportLost and ReportFound (the form changes with the "type" prop)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ItemForm from '../components/ItemForm';
import { itemService, getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ReportItem({ type }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');
    try {
      const res = await itemService.create(formData);
      showToast(res.data.message);
      navigate(`/items/${res.data.item._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="narrow">
      <h1>{type === 'lost' ? 'Report a lost item' : 'Report a found item'}</h1>
      <p className="muted">
        {type === 'lost'
          ? 'Give as much detail as you can so whoever finds it can recognise it.'
          : 'Thanks for helping! Describe it and where it is now. Keep one identifying detail private for verification.'}
      </p>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <ItemForm type={type} onSubmit={handleSubmit} loading={loading} submitLabel={type === 'lost' ? 'Report lost item' : 'Report found item'} />
    </div>
  );
}
