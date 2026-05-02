import CategoryManager from '../../components/common/CategoryManager'
import TabbedManage    from '../../components/common/TabbedManage'
import { staysApi }    from '../../services/api'

export default function StaysManage() {
  return (
    <TabbedManage
      title="Stay — Manage"
      backTo="/stays/list"
      tabs={[
        {
          label: 'Categories',
          content: (
            <CategoryManager
              title="Categories" entityLabel="Category" hideHeader
              getAll={()           => staysApi.getCategories()}
              create={(data)       => staysApi.createCategory(data)}
              update={(id, data)   => staysApi.updateCategory(id, data)}
              remove={(id)         => staysApi.deleteCategory(id)}
            />
          ),
        },
        {
          label: 'Locations',
          content: (
            <CategoryManager
              title="Locations" entityLabel="Location" hideHeader
              getAll={()           => staysApi.getLocations()}
              create={(data)       => staysApi.createLocation(data)}
              update={(id, data)   => staysApi.updateLocation(id, data)}
              remove={(id)         => staysApi.deleteLocation(id)}
            />
          ),
        },
      ]}
    />
  )
}
