import CategoryManager from '../../components/common/CategoryManager'
import TabbedManage    from '../../components/common/TabbedManage'
import { tourismApi }  from '../../services/api'

export default function TourismManage() {
  return (
    <TabbedManage
      title="Tourism — Manage"
      backTo="/tourism/list"
      tabs={[
        {
          label: 'Categories',
          content: (
            <CategoryManager
              title="Categories" entityLabel="Category" hideHeader
              getAll={()           => tourismApi.getCategories()}
              create={(data)       => tourismApi.createCategory(data)}
              update={(id, data)   => tourismApi.updateCategory(id, data)}
              remove={(id)         => tourismApi.deleteCategory(id)}
            />
          ),
        },
        {
          label: 'Locations',
          content: (
            <CategoryManager
              title="Locations" entityLabel="Location" hideHeader
              getAll={()           => tourismApi.getLocations()}
              create={(data)       => tourismApi.createLocation(data)}
              update={(id, data)   => tourismApi.updateLocation(id, data)}
              remove={(id)         => tourismApi.deleteLocation(id)}
            />
          ),
        },
      ]}
    />
  )
}
