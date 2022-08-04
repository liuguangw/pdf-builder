<template>
  <div class="project-container">
    <message-tip v-show="showMessage" :message-type="messageType" :message="message"
                 @dialog-close="showMessage = false"/>
    <div class="header">
      <div class="nav">
        <router-link :to="{name:'index'}">首页</router-link>
        <span class="sep">/</span>
        <span class="title">{{ title }}</span>
      </div>
      <div class="btn-area">
        <button class="btn" type="button" @click="showSourceDialog = true">查看抓取脚本</button>
      </div>
    </div>
    <source-dialog v-if="showSourceDialog" @dialog-close="showSourceDialog = false"
                   :project-name="projectName" :doc-url="docURL" :source-content="fetchScript"/>
  </div>
</template>

<script>
import {useRoute} from 'vue-router'
import {onMounted, ref} from "vue";
import useFetchBookInfo from "./fetch_book_info.js";
import MessageTip from "../../components/MessageTip.vue";
import SourceDialog from "../../components/SourceDialog.vue";

export default {
  name: "BookProject",
  components: {SourceDialog, MessageTip},
  setup() {
    const projectName = ref("")
    const route = useRoute()
    const showMessage = ref(false)
    const messageType = ref(0)
    const message = ref("")
    const showSourceDialog = ref(true);
    const {
      docURL, fetchScript, title,
      fetchBookInfo
    } = useFetchBookInfo(showMessage, messageType, message)
    onMounted(async () => {
      projectName.value = route.params.projectName
      await fetchBookInfo(projectName.value)
    })
    return {
      projectName,
      docURL, fetchScript, title,
      showMessage, messageType, message,
      showSourceDialog
    }
  }
}
</script>

<style lang="scss" scoped>
.project-container {
  max-width: 1000px;
  margin: 0 auto;

  .header {
    padding: 15px 8px;
    border-bottom: 1px solid #cccccc;

    &:after {
      content: "020";
      display: block;
      height: 0;
      clear: both;
      visibility: hidden;
    }

    .nav {
      float: left;
      padding: 6px 0;

      a {
        display: inline-block;
        color: #0969da;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }

      span {
        display: inline-block;
        color: #24292f;

        &.sep {
          color: #57606a;
          margin: 0 4px;
        }
      }
    }
  }

  .btn {
    position: relative;
    display: inline-block;
    padding: 5px 16px;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    white-space: nowrap;
    vertical-align: middle;
    cursor: pointer;
    user-select: none;
    border: 1px solid rgba(27, 31, 36, 0.15);
    border-radius: 6px;
    appearance: none;

    color: #24292f;
    background: #f6f8fa;
    box-shadow: 0 1px 0 rgba(27, 31, 36, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.25);
    transition: 80ms cubic-bezier(0.33, 1, 0.68, 1);
    transition-property: color, background-color, box-shadow, border-color;

    &:hover {
      background-color: #f3f4f6;
      border-color: rgba(27, 31, 36, 0.15);
    }

    &:active {
      background-color: hsla(220, 14%, 93%, 1);
      border-color: rgba(27, 31, 36, 0.15);
      transition: none;
    }
  }

  .btn-area {
    float: right;

    button {
      display: block;
    }
  }
}
</style>
