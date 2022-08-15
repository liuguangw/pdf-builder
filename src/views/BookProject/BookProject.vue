<template>
  <div class="project-container">
    <message-tip v-if="showMessage" :message-type="messageType" :message="message"
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
    <div class="xterm-area">
      <div class="xterm-container" ref="xterm"></div>
    </div>
    <div class="build-btn-area">
      <button type="button" :disabled="!canBuild" @click="buildBook">构建pdf</button>
    </div>
    <source-dialog v-if="showSourceDialog" @dialog-close="showSourceDialog = false"
                   @copy-success="showCopySuccessMessage"
                   @copy-error="showErrorMessage"
                   @build-book="forceBuildBook"
                   :project-name="projectName" :doc-url="docURL" :source-content="fetchScript"/>
  </div>
</template>

<script setup>
import {useRoute} from 'vue-router'
import {onMounted, onUnmounted, ref} from "vue";
import {io} from "socket.io-client";
import "xterm/css/xterm.css";
import 'animate.css';
import useFetchBookInfo from "./fetch_book_info.js";
import MessageTip from "../../components/MessageTip.vue";
import SourceDialog from "../../components/SourceDialog.vue";
import {defaultMessageState, MESSAGE_TYPE_ERROR, MESSAGE_TYPE_SUCCESS} from "../../common/message.js";
import useTerminalHandler from "./terminal_handler.js";
import requestServerAPI from "../../common/request_server_api.js";


const route = useRoute()
const projectName = ref(route.params.projectName)
const {messageType, message, showMessage} = defaultMessageState()
const showSourceDialog = ref(false);
const xterm = ref(null);
const socketClient = io();

function showSuccessMessage(msgContent) {
  message.value = msgContent
  messageType.value = MESSAGE_TYPE_SUCCESS
  showMessage.value = true
}

function showErrorMessage(msgContent) {
  message.value = msgContent
  messageType.value = MESSAGE_TYPE_ERROR
  showMessage.value = true
}

function showCopySuccessMessage() {
  showSuccessMessage("复制代码成功")
}

const {
  docURL, fetchScript, title
} = useFetchBookInfo(projectName.value, showSuccessMessage, showErrorMessage)
const {
  canBuild,
  initTerminal
} = useTerminalHandler(showSuccessMessage, showErrorMessage)
onMounted(async () => {
  //初始化 terminal
  initTerminal(xterm, projectName.value, socketClient)
});
onUnmounted(() => {
  socketClient.close();
})

async function processBuildBook() {
  canBuild.value = false
  try {
    let buildResult = await requestServerAPI("/api/book-build", {
      bookName: projectName.value
    })
    let buildResponse = buildResult.data
    if (buildResponse.code !== 0) {
      showErrorMessage(buildResponse.message)
      canBuild.value = true
      console.error(buildResponse.message)
    }
  } catch (e) {
    showErrorMessage(e.message)
    canBuild.value = true
    console.error(e)
  }
}

async function buildBook() {
  if (!canBuild.value) {
    return
  }
  await processBuildBook()
}

async function forceBuildBook() {
  showSourceDialog.value = false
  await processBuildBook()
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

  .xterm-area {
    padding: 15px 8px;

    .xterm-container {
      min-height: 480px;
      position: relative;
    }
  }

  .build-btn-area {
    margin-top: 15px;
    padding: 0 8px;
    text-align: center;

    button {
      padding: 14px 40px;
      display: inline-block;
      cursor: pointer;
      font-size: 20px;
      border-radius: 8px;
      outline: none;
      border: 1px solid #0d6efd;
      color: #ffffff;
      background: #0d6efd;

      &:hover {
        background-color: #0b5ed7;
        border-color: #0a58ca;
      }

      &:active {
        background-color: #0a58ca;
        border-color: #0a53be;
      }

      &:disabled {
        border-color: #0d6efd;
        background-color: #0d6efd;
        opacity: 0.65;
        cursor: not-allowed;
      }
    }
  }
}
</style>
