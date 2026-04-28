import CategoryManager    from '../../components/common/CategoryManager'
import TabbedManage       from '../../components/common/TabbedManage'
import { realEstateApi }  from '../../services/api'

export default function RealEstateManage() {
  return (
    <TabbedManage
      title="Real Estate — Manage"
      tabs={[
        {
          label: 'Property Types',
          content: (
            <CategoryManager
              title="Property Types" entityLabel="Property Type" hideHeader
              getAll={()           => realEstateApi.getTypes()}
              create={(data)       => realEstateApi.createType(data)}
              update={(id, data)   => realEstateApi.updateType(id, data)}
              remove={(id)         => realEstateApi.deleteType(id)}
            />
          ),
        },
        {
          label: 'Locations',
          content: (
            <CategoryManager
              title="Locations" entityLabel="Location" hideHeader
              getAll={()           => realEstateApi.getLocations()}
              create={(data)       => realEstateApi.createLocation(data)}
              update={(id, data)   => realEstateApi.updateLocation(id, data)}
              remove={(id)         => realEstateApi.deleteLocation(id)}
            />
          ),
        },
        {
          label: 'Amenities',
          content: (
            <CategoryManager
              title="Amenities" entityLabel="Amenity" hideHeader
              getAll={()           => realEstateApi.getAmenities()}
              create={(data)       => realEstateApi.createAmenity(data)}
              update={(id, data)   => realEstateApi.updateAmenity(id, data)}
              remove={(id)         => realEstateApi.deleteAmenity(id)}
            />
          ),
        },
      ]}
    />
  )
}
