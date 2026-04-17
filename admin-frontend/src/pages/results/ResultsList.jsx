import ModuleList from '../../components/common/ModuleList'
import ResultForm from '../../components/forms/ResultForm'
import { resultsApi } from '../../services/api'
import useResultsStore from '../../store/resultsStore'

export default function ResultsList() {
  return (
    <ModuleList
      title="Results"
      collectionName="results"
      store={useResultsStore}
      api={resultsApi}
      titleKey="examName"
      FormComponent={ResultForm}
      idPrefix="RSL"
    />
  )
}
