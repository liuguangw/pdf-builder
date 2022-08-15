import {onMounted, ref} from "vue";
import {MESSAGE_TYPE_ERROR} from "../../common/message.js";
import {requestServerGetAPI} from "../../common/request_server_api.js";

export default function useFetchBookList({messageType, message, showMessage}) {
    const bookList = ref([])
    const fetchBookList = async () => {
        try {
            let fetchResult = await requestServerGetAPI("/api/books")
            if (fetchResult.headers["content-type"].indexOf("application/json") !== -1) {
                bookList.value = fetchResult.data
            }
        } catch (e) {
            messageType.value = MESSAGE_TYPE_ERROR
            message.value = e.message
            showMessage.value = true
            console.error(e)
        }
    }
    onMounted(fetchBookList)
    return bookList
}
