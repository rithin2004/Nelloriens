import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import MovieForm from '../../components/forms/MovieForm'
import { moviesApi } from '../../services/api'

export default function MoviesCreate() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (data) => {
    setLoading(true)
    try { await moviesApi.create(data); toast.success('Movie created!'); navigate('/movies/list') }
    catch (e) { toast.error(e.message) }
    finally { setLoading(false) }
  }
  return <div className="max-w-3xl"><PageHeader title="Add Movie" backTo="/movies" /><MovieForm onSubmit={handleSubmit} loading={loading} /></div>
}
