<template>
  <div class="project-container">
    <message-tip v-show="showMessage" :message-type="messageType" :message="message"
                 @dialog-close="showMessage = false"/>
    <p>todo 《{{ title }}》</p>
  </div>
</template>

<script>
import {useRoute} from 'vue-router'
import {onMounted, ref} from "vue";
import useFetchBookInfo from "./fetch_book_info.js";
import MessageTip from "../../components/MessageTip.vue";

export default {
  name: "BookProject",
  components: {MessageTip},
  setup() {
    const route = useRoute()
    const showMessage = ref(false)
    const messageType = ref(0)
    const message = ref("")
    const {
      docURL, fetchScript, title,
      fetchBookInfo
    } = useFetchBookInfo(showMessage, messageType, message)
    onMounted(async () => {
      await fetchBookInfo(route.params.projectName)
    })
    return {
      docURL, fetchScript, title,
      showMessage, messageType, message
    }
  }
}
</script>

<style scoped>

</style>
