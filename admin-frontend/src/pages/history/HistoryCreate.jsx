import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import HistoryForm from '../../components/forms/HistoryForm'
import { historyApi } from '../../services/api'

export default function HistoryCreate() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (data) => {
    setLoading(true)
    try { await historyApi.create(data); toast.success('Created!'); navigate('/history') }
    catch (e) { toast.error(e.message) }
    finally { setLoading(false) }
  }
  return <div className="animate-fade-in"><PageHeader title="Add History" backTo="/history" /><HistoryForm onSubmit={handleSubmit} loading={loading} /></div>
}
