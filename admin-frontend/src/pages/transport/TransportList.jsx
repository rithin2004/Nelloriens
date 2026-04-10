import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tag } from 'lucide-react'
import ModuleList from '../../components/common/ModuleList'
import TransportForm from '../../components/forms/TransportForm'
import { transportApi } from '../../services/api'

export default function TransportList() {
  const navigate    = useNavigate()
  const [categories, setCategories] = useState([])

  useEffect(() => {
    transportApi.getCategories().then((r) => setCategories(r.data || [])).catch(() => {})
  }, [])

  return (
    <ModuleList
      title="Transport"
      api={transportApi}
      titleKey="name"
      FormComponent={TransportForm}
      extraFilters={
        categories.length > 0
          ? [{ key: 'category', label: 'Category', options: categories.map((c) => ({ label: c.name, value: c._id })) }]
          : []
      }
      headerExtra={
        <button
          onClick={() => navigate('/transport/categories')}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-all"
          style={{ background: '#dce8fb', border: '1px solid #dce8fb', color: '#0a3d95' }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#c8dafd'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#dce8fb'}
        >
          <Tag className="w-4 h-4" /> Transport Categories
        </button>
      }
    />
  )
}
