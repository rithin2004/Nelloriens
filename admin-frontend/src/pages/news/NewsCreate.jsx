import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import NewsForm from '../../components/forms/NewsForm'
import { newsApi } from '../../services/api'

export default function NewsCreate() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data) => {
    setLoading(true)
    try {
      await newsApi.create(data)
      toast.success('News created!')
      navigate('/news/list')
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader title="Add News" backTo="/news" />
      <NewsForm onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
