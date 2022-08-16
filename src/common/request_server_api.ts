import axios, { AxiosResponse } from 'axios'
import { ApiResponse } from '../../server/common/response'

export type Response1<U> = AxiosResponse<ApiResponse<U>>
/**
 * POST请求
 * @param apiPath
 * @param postData
 */
export default function requestServerAPI<T, U>(apiPath: string, postData: T): Promise<Response1<U>> {
  return axios.post(apiPath, postData)
}

/**
 * GET请求
 * @param apiPath
 */
export function requestServerGetAPI<U>(apiPath: string): Promise<Response1<U>> {
  return axios.get(apiPath)
}
