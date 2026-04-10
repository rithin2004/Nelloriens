import { useEffect, useState } from 'react'; import { useNavigate, useParams } from 'react-router-dom'; import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'; import FoodForm from '../../components/forms/FoodForm'; import LoadingSpinner from '../../components/common/LoadingSpinner'; import { foodsApi } from '../../services/api'
export default function FoodsEdit() {
  const { id } = useParams(); const navigate = useNavigate(); const [item, setItem] = useState(null); const [loading, setLoading] = useState(false)
  useEffect(() => { foodsApi.getById(id).then((r) => setItem(r.data)).catch(() => toast.error('Failed')) }, [id])
  const handleSubmit = async (data) => { setLoading(true); try { await foodsApi.update(id, data); toast.success('Updated!'); navigate('/foods') } catch (e) { toast.error(e.message) } finally { setLoading(false) } }
  if (!item) return <LoadingSpinner />
  return <div className="animate-fade-in"><PageHeader title="Edit Food" backTo="/foods" /><FoodForm defaultValues={item} onSubmit={handleSubmit} loading={loading} /></div>
}
