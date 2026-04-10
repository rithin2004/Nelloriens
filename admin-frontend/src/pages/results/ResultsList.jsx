import ModuleList from '../../components/common/ModuleList'
import ResultForm from '../../components/forms/ResultForm'
import { resultsApi } from '../../services/api'

export default function ResultsList() {
  return (
    <ModuleList
      title="Results"
      api={resultsApi}
      titleKey="examName"
      FormComponent={ResultForm}
    />
  )
}
