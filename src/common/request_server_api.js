import axios from 'axios'

/**
 * POST请求
 *
 * @param {string} apiPath
 * @param {any} postData
 * @return {Promise<AxiosResponse<Object>>}
 */
export default function requestServerAPI(apiPath, postData) {
  return axios.post(apiPath, postData)
}

/**
 * GET请求
 *
 * @param {string} apiPath
 * @return {Promise<AxiosResponse<Object>>}
 */
export function requestServerGetAPI(apiPath) {
  return axios.get(apiPath)
}
