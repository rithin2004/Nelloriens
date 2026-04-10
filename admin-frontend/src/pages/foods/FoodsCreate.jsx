import { useState } from 'react'; import { useNavigate } from 'react-router-dom'; import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'; import FoodForm from '../../components/forms/FoodForm'; import { foodsApi } from '../../services/api'
export default function FoodsCreate() {
  const navigate = useNavigate(); const [loading, setLoading] = useState(false)
  const handleSubmit = async (data) => { setLoading(true); try { await foodsApi.create(data); toast.success('Created!'); navigate('/foods') } catch (e) { toast.error(e.message) } finally { setLoading(false) } }
  return <div className="max-w-3xl"><PageHeader title="Add Food" backTo="/foods" /><FoodForm onSubmit={handleSubmit} loading={loading} /></div>
}
