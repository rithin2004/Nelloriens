import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import ModuleList from '../../components/common/ModuleList'
import OfferForm from '../../components/forms/OfferForm'
import { offersApi } from '../../services/api'
import useOffersStore from '../../store/offersStore'

export default function OffersList() {
  const [togglingVerifiedId, setTogglingVerifiedId] = useState(null)

  const handleToggleVerified = useCallback(async (item) => {
    setTogglingVerifiedId(item._id)
    try {
      await offersApi.update(item._id, { isVerified: !item.isVerified })
      toast.success(item.isVerified ? 'Verification removed' : 'Marked as Verified')
      useOffersStore.getState().fetch()
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update')
    } finally { setTogglingVerifiedId(null) }
  }, [])

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

  return (
    <ModuleList
      title="Offers"
      collectionName="offers"
      store={useOffersStore}
      api={offersApi}
      FormComponent={OfferForm}
      idPrefix="OFR"
      extraColumns={[verifiedColumn]}
    />
  )
}
