import { onMounted, ref } from 'vue'
import requestServerAPI, { Response1 } from '../../common/request_server_api.js'
import { ShowMessageHandler } from '../../common/message'
import { ApiResponse } from '../../../server/common/response'
import { BookInfo } from '../../common/book'

export default function useFetchBookInfo(
  projectName: string,
  showSuccessMessage: ShowMessageHandler,
  showErrorMessage: ShowMessageHandler
) {
  const docURL = ref('')
  const fetchScript = ref('')
  const title = ref('')

  async function fetchBookInfo() {
    try {
      const fetchResult: Response1<BookInfo> = await requestServerAPI('/api/book-info', {
        bookName: projectName
      })
      const bookInfoResponse: ApiResponse<BookInfo> = fetchResult.data
      if (bookInfoResponse.code !== 0) {
        showErrorMessage(bookInfoResponse.message)
        console.error(bookInfoResponse.message)
      } else {
        docURL.value = bookInfoResponse.data.docURL
        fetchScript.value = bookInfoResponse.data.fetchScript !== undefined ? bookInfoResponse.data.fetchScript : ''
        title.value = bookInfoResponse.data.title
      }
    } catch (err) {
      const typedError = err as Error
      showErrorMessage(typedError.message)
      console.error(err)
    }
  }

  onMounted(fetchBookInfo)
  return {
    docURL,
    fetchScript,
    title
  }
}
