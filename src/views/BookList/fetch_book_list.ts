import { onMounted, Ref, ref, ToRefs } from 'vue'
import { MESSAGE_TYPE_ERROR, MessageState } from '../../common/message'
import { requestServerGetAPI } from '../../common/request_server_api'
import { BookInfo } from '../../common/book'

export default function useFetchBookList({ messageType, message, showMessage }: ToRefs<MessageState>) {
  const bookList: Ref<BookInfo[]> = ref([])
  const fetchBookList = async () => {
    try {
      const fetchResult = await requestServerGetAPI<BookInfo[]>('/api/books')
      if (fetchResult.headers['content-type'].indexOf('application/json') !== -1) {
        bookList.value = fetchResult.data.data
      }
    } catch (err) {
      messageType.value = MESSAGE_TYPE_ERROR
      const typedError = err as Error
      message.value = typedError.message
      showMessage.value = true
      console.error(err)
    }
  }
  onMounted(fetchBookList)
  return bookList
}
