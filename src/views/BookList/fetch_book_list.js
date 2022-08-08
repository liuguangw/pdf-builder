import {onMounted, ref} from "vue";
import axios from "axios";

export default function () {
    const bookList = ref([])
    const showMessage = ref(false)
    const messageType = ref(0)
    const message = ref("")
    const fetchBookList = async () => {
        try {
            let fetchResult = await axios.get("/api/books")
            if (fetchResult.headers["content-type"].indexOf("application/json") !== -1) {
                bookList.value = fetchResult.data
            }
        } catch (e) {
            messageType.value = 2
            message.value = e.message
            showMessage.value = true
            console.error(e)
        }
    }
    onMounted(fetchBookList)
    return {
        bookList,
        showMessage,
        messageType,
        message
    }
}
