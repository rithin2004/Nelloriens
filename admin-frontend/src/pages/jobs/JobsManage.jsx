import CategoryManager from '../../components/common/CategoryManager'
import TabbedManage    from '../../components/common/TabbedManage'
import { jobsApi }     from '../../services/api'

export default function JobsManage() {
  return (
    <TabbedManage
      title="Jobs — Manage"
      tabs={[
        {
          label: 'Categories',
          content: (
            <CategoryManager
              title="Categories" entityLabel="Category" hideHeader
              getAll={()           => jobsApi.getCategories()}
              create={(data)       => jobsApi.createCategory(data)}
              update={(id, data)   => jobsApi.updateCategory(id, data)}
              remove={(id)         => jobsApi.deleteCategory(id)}
            />
          ),
        },
        {
          label: 'Locations',
          content: (
            <CategoryManager
              title="Locations" entityLabel="Location" hideHeader
              getAll={()           => jobsApi.getLocations()}
              create={(data)       => jobsApi.createLocation(data)}
              update={(id, data)   => jobsApi.updateLocation(id, data)}
              remove={(id)         => jobsApi.deleteLocation(id)}
            />
          ),
        },
        {
          label: 'Job Types',
          content: (
            <CategoryManager
              title="Job Types" entityLabel="Job Type" hideHeader
              getAll={()           => jobsApi.getTypes()}
              create={(data)       => jobsApi.createType(data)}
              update={(id, data)   => jobsApi.updateType(id, data)}
              remove={(id)         => jobsApi.deleteType(id)}
            />
          ),
        },
      ]}
    />
  )
}
