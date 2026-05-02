import { reportService, dailyWorkService, contractorService } from './services'
import { mockContractors, mockDailyWork, mockReports } from '../data/mockData'

const withFallback = async (requestFn, fallbackData) => {
  try {
    const response = await requestFn()
    return response.data || response
  } catch (error) {
    console.error('API Error:', error)
    return fallbackData
  }
}

export const fetchReports = (params = {}) =>
  withFallback(
    () => reportService.list(params),
    { count: mockReports.length, next: null, previous: null, results: mockReports },
  )

export const fetchReportDetails = (id) =>
  withFallback(() => reportService.get(id), mockReports.find((item) => item.id === Number(id)))

export const fetchContractors = (params = {}) =>
  withFallback(
    () => contractorService.list(params),
    { count: mockContractors.length, next: null, previous: null, results: mockContractors },
  )

export const fetchContractorDetails = (id) =>
  withFallback(() => contractorService.get(id), mockContractors.find((item) => item.id === Number(id)))

export const fetchDailyWork = (params = {}) => {
  const { contractor_id, ...rest } = params
  let results = mockDailyWork
  if (contractor_id) {
    results = results.filter((item) => item.contractor_id === Number(contractor_id))
  }
  return withFallback(
    () => dailyWorkService.list(params),
    { count: results.length, next: null, previous: null, results },
  )
}
