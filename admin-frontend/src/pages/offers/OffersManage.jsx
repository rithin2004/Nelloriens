import CategoryManager from '../../components/common/CategoryManager'
import TabbedManage    from '../../components/common/TabbedManage'
import { offersApi }   from '../../services/api'

export default function OffersManage() {
  return (
    <TabbedManage
      title="Offers — Manage"
      backTo="/offers/list"
      tabs={[
        {
          label: 'Categories',
          content: (
            <CategoryManager
              title="Categories" entityLabel="Category" hideHeader
              getAll={()           => offersApi.getCategories()}
              create={(data)       => offersApi.createCategory(data)}
              update={(id, data)   => offersApi.updateCategory(id, data)}
              remove={(id)         => offersApi.deleteCategory(id)}
            />
          ),
        },
        {
          label: 'Locations',
          content: (
            <CategoryManager
              title="Locations" entityLabel="Location" hideHeader
              getAll={()           => offersApi.getLocations()}
              create={(data)       => offersApi.createLocation(data)}
              update={(id, data)   => offersApi.updateLocation(id, data)}
              remove={(id)         => offersApi.deleteLocation(id)}
            />
          ),
        },
        {
          label: 'Offer Types',
          content: (
            <CategoryManager
              title="Offer Types" entityLabel="Offer Type" hideHeader
              getAll={()           => offersApi.getTypes()}
              create={(data)       => offersApi.createType(data)}
              update={(id, data)   => offersApi.updateType(id, data)}
              remove={(id)         => offersApi.deleteType(id)}
            />
          ),
        },
      ]}
    />
  )
}
