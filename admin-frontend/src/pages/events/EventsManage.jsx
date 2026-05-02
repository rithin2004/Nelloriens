import CategoryManager from '../../components/common/CategoryManager'
import TabbedManage    from '../../components/common/TabbedManage'
import { eventsApi }   from '../../services/api'

export default function EventsManage() {
  return (
    <TabbedManage
      title="Events — Manage"
      backTo="/events/list"
      tabs={[
        {
          label: 'Categories',
          content: (
            <CategoryManager
              title="Categories" entityLabel="Category" hideHeader
              getAll={()           => eventsApi.getCategories()}
              create={(data)       => eventsApi.createCategory(data)}
              update={(id, data)   => eventsApi.updateCategory(id, data)}
              remove={(id)         => eventsApi.deleteCategory(id)}
            />
          ),
        },
        {
          label: 'Locations',
          content: (
            <CategoryManager
              title="Locations" entityLabel="Location" hideHeader
              getAll={()           => eventsApi.getLocations()}
              create={(data)       => eventsApi.createLocation(data)}
              update={(id, data)   => eventsApi.updateLocation(id, data)}
              remove={(id)         => eventsApi.deleteLocation(id)}
            />
          ),
        },
      ]}
    />
  )
}
