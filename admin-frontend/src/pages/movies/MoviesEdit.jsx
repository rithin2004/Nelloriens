import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import MovieForm from '../../components/forms/MovieForm'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { moviesApi } from '../../services/api'

export default function MoviesEdit() {
  const { id } = useParams(); const navigate = useNavigate()
  const [item, setItem] = useState(null); const [loading, setLoading] = useState(false)
  useEffect(() => { moviesApi.getById(id).then((r) => setItem(r.data)).catch(() => toast.error('Failed')) }, [id])
  const handleSubmit = async (data) => {
    setLoading(true)
    try { await moviesApi.update(id, data); toast.success('Updated!'); navigate('/movies/list') }
    catch (e) { toast.error(e.message) }
    finally { setLoading(false) }
  }
  if (!item) return <LoadingSpinner />
  return <div className="max-w-3xl"><PageHeader title="Edit Movie" backTo="/movies" /><MovieForm defaultValues={item} onSubmit={handleSubmit} loading={loading} /></div>
}
