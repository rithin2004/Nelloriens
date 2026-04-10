import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import NewsForm from '../../components/forms/NewsForm'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { newsApi } from '../../services/api'

export default function NewsEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    newsApi.getById(id).then((r) => setItem(r.data)).catch(() => toast.error('Failed to load'))
  }, [id])

  const handleSubmit = async (data) => {
    setLoading(true)
    try {
      await newsApi.update(id, data)
      toast.success('News updated!')
      navigate('/news/list')
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  if (!item) return <LoadingSpinner />

  return (
    <div className="animate-fade-in">
      <PageHeader title="Edit News" backTo="/news" />
      <NewsForm defaultValues={item} onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
