import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ItemForm from '../components/ItemForm';
import Loader from '../components/Loader';
import { itemService, getErrorMessage, imageUrl } from '../services/api';
import { toDateInput } from '../utils';
import { useToast } from '../context/ToastContext';

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    itemService
      .get(id)
      .then((res) => {
        if (!res.data.isOwner) setError('You can only edit your own listings.');
        else setItem(res.data.item);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (formData) => {
    setSaving(true);
    setError('');
    try {
      await itemService.update(id, formData);
      showToast('Listing updated');
      navigate('/my-listings');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;
  if (!item) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="narrow">
      <h1>Edit listing</h1>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <ItemForm
        type={item.itemType}
        initialValues={{ ...item, date: toDateInput(item.date) }}
        existingImage={item.image ? imageUrl(item.image) : ''}
        onSubmit={handleSubmit}
        loading={saving}
        submitLabel="Save changes"
      />
    </div>
  );
}
