import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tag, MapPin } from 'lucide-react'
import ModuleList from '../../components/common/ModuleList'
import JobForm from '../../components/forms/JobForm'
import { jobsApi } from '../../services/api'
import useJobsStore from '../../store/jobsStore'

export default function JobsList() {
  const navigate    = useNavigate()
  const [categories, setCategories] = useState([])
  const [locations,  setLocations]  = useState([])

  useEffect(() => {
    jobsApi.getCategories().then((r) => setCategories(r.data.data || [])).catch(() => {})
    jobsApi.getLocations().then((r)  => setLocations(r.data.data  || [])).catch(() => {})
  }, [])

  const btnBase = 'flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-all'

  return (
    <ModuleList
      title="Jobs"
      collectionName="jobs"
      store={useJobsStore}
      api={jobsApi}
      titleKey="title"
      FormComponent={JobForm}
      idPrefix="JOB"
      extraFilters={[
        ...(categories.length > 0 ? [{ key: 'category', label: 'Category', options: categories.map((c) => ({ label: c.name, value: c._id })) }] : []),
        ...(locations.length  > 0 ? [{ key: 'location', label: 'Location',  options: locations.map((l)  => ({ label: l.name, value: l._id })) }] : []),
      ]}
      headerExtra={
        <>
          <button
            onClick={() => navigate('/jobs/categories')}
            className={btnBase}
            style={{ background: '#dce8fb', border: '1px solid #dce8fb', color: '#0a3d95' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#c8dafd'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#dce8fb'}
          >
            <Tag className="w-4 h-4" /> Job Categories
          </button>
          <button
            onClick={() => navigate('/jobs/locations')}
            className={btnBase}
            style={{ background: '#dce8fb', border: '1px solid #dce8fb', color: '#0a3d95' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#c8dafd'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#dce8fb'}
          >
            <MapPin className="w-4 h-4" /> Job Locations
          </button>
        </>
      }
    />
  )
}
