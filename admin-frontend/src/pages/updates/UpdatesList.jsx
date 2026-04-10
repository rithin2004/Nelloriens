import { useEffect, useState } from 'react'
import ModuleList from '../../components/common/ModuleList'
import UpdateForm from '../../components/forms/UpdateForm'
import { updatesApi } from '../../services/api'

export default function UpdatesList() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    updatesApi.getCategories().then((r) => setCategories(r.data || [])).catch(() => {})
  }, [])

  return (
    <ModuleList
      title="Updates"
      api={updatesApi}
      FormComponent={UpdateForm}
      extraFilters={
        categories.length > 0
          ? [{ key: 'category', label: 'Category', options: categories.map((c) => ({ label: c.name, value: c._id })) }]
          : []
      }
    />
  )
}
