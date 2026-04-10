import { useState } from 'react'; import { useNavigate } from 'react-router-dom'; import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'; import OfferForm from '../../components/forms/OfferForm'; import { offersApi } from '../../services/api'
export default function OffersCreate() {
  const navigate = useNavigate(); const [loading, setLoading] = useState(false)
  const handleSubmit = async (data) => { setLoading(true); try { await offersApi.create(data); toast.success('Created!'); navigate('/offers/list') } catch (e) { toast.error(e.message) } finally { setLoading(false) } }
  return <div className="animate-fade-in"><PageHeader title="Add Offer" backTo="/offers" /><OfferForm onSubmit={handleSubmit} loading={loading} /></div>
}
