import { ExpertAnalysisPage } from './_page/expert-analysis-page'
import { AnalysisUrlSync } from './_providers/analysis-store'

export default function ExpertAnalysisRoute() {
  return (
    <>
      <AnalysisUrlSync />
      <ExpertAnalysisPage />
    </>
  )
}
