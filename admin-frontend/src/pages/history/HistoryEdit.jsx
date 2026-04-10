import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import HistoryForm from '../../components/forms/HistoryForm'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { historyApi } from '../../services/api'

export default function HistoryEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => { historyApi.getById(id).then((r) => setItem(r.data)).catch(() => toast.error('Failed')) }, [id])
  const handleSubmit = async (data) => {
    setLoading(true)
    try { await historyApi.update(id, data); toast.success('Updated!'); navigate('/history') }
    catch (e) { toast.error(e.message) }
    finally { setLoading(false) }
  }
  if (!item) return <LoadingSpinner />
  return <div className="animate-fade-in"><PageHeader title="Edit History" backTo="/history" /><HistoryForm defaultValues={item} onSubmit={handleSubmit} loading={loading} /></div>
}
