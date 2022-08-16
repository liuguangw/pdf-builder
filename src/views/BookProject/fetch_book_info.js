import { onMounted, ref } from 'vue'
import requestServerAPI from '../../common/request_server_api.js'

export default function useFetchBookInfo(projectName, showSuccessMessage, showErrorMessage) {
  const docURL = ref('')
  const fetchScript = ref('')
  const title = ref('')

  async function fetchBookInfo() {
    try {
      let fetchResult = await requestServerAPI('/api/book-info', {
        bookName: projectName
      })
      let bookInfoResponse = fetchResult.data
      if (bookInfoResponse.code !== 0) {
        showErrorMessage(bookInfoResponse.message)
        console.error(bookInfoResponse.message)
      } else {
        docURL.value = bookInfoResponse.data.docURL
        fetchScript.value = bookInfoResponse.data.fetchScript
        title.value = bookInfoResponse.data.title
      }
    } catch (e) {
      showErrorMessage(e.message)
      console.error(e)
    }
  }

  onMounted(fetchBookInfo)
  return {
    docURL,
    fetchScript,
    title
  }
}
