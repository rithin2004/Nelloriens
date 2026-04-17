import { useEffect, useState } from 'react'; import { useNavigate } from 'react-router-dom'; import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'; import FoodForm from '../../components/forms/FoodForm'; import LoadingSpinner from '../../components/common/LoadingSpinner'; import { foodsApi, uploadApi } from '../../services/api'
export default function FoodsCreate() {
  const navigate = useNavigate(); const [loading, setLoading] = useState(false)
  const [reservedId, setReservedId] = useState(null); const [idLoading, setIdLoading] = useState(true)
  useEffect(() => {
    uploadApi.reserveId('FOD').then((r) => setReservedId(r.data.data.id)).catch(() => toast.error('Failed to reserve ID')).finally(() => setIdLoading(false))
  }, [])
  const handleSubmit = async (data) => { setLoading(true); try { await foodsApi.create(reservedId ? { ...data, _reservedId: reservedId } : data); toast.success('Created!'); navigate('/foods') } catch (e) { toast.error(e.message) } finally { setLoading(false) } }
  if (idLoading) return <LoadingSpinner />
  return <div className="animate-fade-in"><PageHeader title="Add Food" backTo="/foods" /><FoodForm onSubmit={handleSubmit} loading={loading} contentId={reservedId} /></div>
}
