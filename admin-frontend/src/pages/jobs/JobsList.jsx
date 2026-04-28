import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tag, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import ModuleList from '../../components/common/ModuleList'
import JobForm from '../../components/forms/JobForm'
import { jobsApi } from '../../services/api'
import useJobsStore from '../../store/jobsStore'

export default function JobsList() {
  const navigate    = useNavigate()
  const [categories, setCategories] = useState([])
  const [locations,  setLocations]  = useState([])
  const [togglingVerifiedId, setTogglingVerifiedId] = useState(null)
  const { fetch } = useJobsStore()

  useEffect(() => {
    jobsApi.getCategories().then((r) => setCategories(r.data.data || [])).catch(() => {})
    jobsApi.getLocations().then((r)  => setLocations(r.data.data  || [])).catch(() => {})
  }, [])

  const handleToggleVerified = useCallback(async (item) => {
    setTogglingVerifiedId(item._id)
    try {
      await jobsApi.update(item._id, { isVerified: !item.isVerified })
      toast.success(item.isVerified ? 'Verification removed' : 'Marked as Verified')
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update')
    } finally { setTogglingVerifiedId(null) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const verifiedColumn = {
    id: 'isVerified',
    header: 'Verified',
    cell: ({ row }) => (
      <button
        type="button"
        onClick={() => handleToggleVerified(row.original)}
        disabled={togglingVerifiedId === row.original._id}
        className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-40"
        style={{ background: row.original.isVerified ? '#10B981' : '#CBD5E1' }}
        title={row.original.isVerified ? 'Remove Verification' : 'Mark as Verified'}
      >
        <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5"
          style={{ marginLeft: row.original.isVerified ? '18px' : '2px' }} />
      </button>
    ),
  }

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
      extraColumns={[verifiedColumn]}
      extraFilters={[
        ...(categories.length > 0 ? [{ key: 'category', label: 'Category', options: categories.map((c) => ({ label: c.name, value: c._id })) }] : []),
        ...(locations.length  > 0 ? [{ key: 'location', label: 'Location',  options: locations.map((l)  => ({ label: l.name, value: l._id })) }] : []),
      ]}
      headerExtra={
        <>
          <button
            onClick={() => navigate('/jobs/manage')}
            className={btnBase}
            style={{ background: '#dce8fb', border: '1px solid #dce8fb', color: '#0a3d95' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#c8dafd'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#dce8fb'}
          >
            <Tag className="w-4 h-4" /> Job Categories
          </button>
          <button
            onClick={() => navigate('/jobs/manage')}
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
