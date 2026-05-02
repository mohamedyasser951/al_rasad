import { reportService, dailyWorkService, contractorService } from './services'

const handleResponse = async (requestFn) => {
  try {
    const response = await requestFn()
    return response.data || response
  } catch (error) {
    console.error('API Error:', error)
    throw error // Let the UI handle the error or show ErrorState
  }
}

export const fetchReports = (params = {}) =>
  handleResponse(() => reportService.list(params))

export const fetchReportDetails = (id) =>
  handleResponse(() => reportService.get(id))

export const fetchContractors = (params = {}) =>
  handleResponse(() => contractorService.list(params))

export const fetchContractorDetails = (id) =>
  handleResponse(() => contractorService.get(id))

export const fetchDailyWork = (params = {}) => 
  handleResponse(() => dailyWorkService.list(params))
