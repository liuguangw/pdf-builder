import {ref} from "vue";
import axios from "axios";

export default function (showMessage, messageType, message) {
    const docURL = ref("")
    const fetchScript = ref("")
    const title = ref("")

    const fetchBookInfo = async (projectName) => {
        try {
            let fetchResult = await axios.get("/api/books/" + projectName + "/info")
            let bookInfoResponse = fetchResult.data
            if (bookInfoResponse.code !== 0) {
                messageType.value = 1
                message.value = bookInfoResponse.message
                showMessage.value = true
                console.error(message.value)
            } else {
                docURL.value = bookInfoResponse.data.docURL
                fetchScript.value = bookInfoResponse.data.fetchScript
                title.value = bookInfoResponse.data.title
            }
        } catch (e) {
            messageType.value = 1
            message.value = e.message
            showMessage.value = true
            console.error(message.value)
        }
    }
    return {
        docURL, fetchScript, title,
        fetchBookInfo
    }
}
