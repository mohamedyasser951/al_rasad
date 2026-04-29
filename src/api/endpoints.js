import { apiGet } from './client'
import { mockContractors, mockDailyWork, mockReports } from '../data/mockData'

const withFallback = async (requestFn, fallbackData) => {
  try {
    return await requestFn()
  } catch {
    return fallbackData
  }
}

export const fetchReports = (params = {}) =>
  withFallback(
    () => apiGet('/api/reports/', params),
    { count: mockReports.length, next: null, previous: null, results: mockReports },
  )

export const fetchReportDetails = (id) =>
  withFallback(() => apiGet(`/api/reports/${id}/`), mockReports.find((item) => item.id === Number(id)))

export const fetchContractors = (params = {}) =>
  withFallback(
    () => apiGet('/api/contractors/', params),
    { count: mockContractors.length, next: null, previous: null, results: mockContractors },
  )

export const fetchContractorDetails = (id) =>
  withFallback(() => apiGet(`/api/contractors/${id}/`), mockContractors.find((item) => item.id === Number(id)))

export const fetchDailyWork = (params = {}) => {
  const { contractor_id, ...rest } = params
  let results = mockDailyWork
  if (contractor_id) {
    results = results.filter((item) => item.contractor_id === Number(contractor_id))
  }
  return withFallback(
    () => apiGet('/api/daily-work/', params),
    { count: results.length, next: null, previous: null, results },
  )
}
