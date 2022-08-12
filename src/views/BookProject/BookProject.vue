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
                   :project-name="projectName" :doc-url="docURL" :source-content="fetchScript"/>
  </div>
</template>

<script>
import {useRoute} from 'vue-router'
import {onMounted, onUnmounted, ref} from "vue";
import {io} from "socket.io-client";
import "xterm/css/xterm.css";
import 'animate.css';
import initTerminal from "./terminal_handler.js"
import useFetchBookInfo from "./fetch_book_info.js";
import MessageTip from "../../components/MessageTip.vue";
import SourceDialog from "../../components/SourceDialog.vue";
import axios from "axios";

export default {
  name: "BookProject",
  components: {
    SourceDialog,
    MessageTip
  },
  setup() {
    const projectName = ref("")
    const route = useRoute()
    const showMessage = ref(false)
    const messageType = ref(0)
    const message = ref("")
    const showSourceDialog = ref(false);
    const xterm = ref(null);
    const socketClient = io();
    const canBuild = ref(false);
    const {
      docURL, fetchScript, title,
      fetchBookInfo
    } = useFetchBookInfo(showMessage, messageType, message)
    onMounted(async () => {
      //获取project信息
      projectName.value = route.params.projectName;
      //初始化 terminal
      initTerminal(xterm, projectName, socketClient, showMessage, messageType, message, canBuild)
      await fetchBookInfo(projectName.value);
    });
    onUnmounted(() => {
      socketClient.close();
    })
    return {
      projectName,
      docURL, fetchScript, title,
      showMessage, messageType, message,
      showSourceDialog, xterm,
      canBuild
    }
  },
  methods: {
    showCopySuccessMessage() {
      this.message = "复制代码成功";
      this.messageType = 1;
      this.showMessage = true;
    },
    async buildBook() {
      if (!this.canBuild) {
        return
      }
      try {
        let buildResult = await axios.post("/api/book-build", {
          bookName: this.projectName
        })
        let buildResponse = buildResult.data
        if (buildResponse.code !== 0) {
          this.message = buildResponse.message;
          this.messageType = 2;
          this.showMessage = true;
          console.error(buildResponse.message)
        } else {
          this.canBuild = false
        }
      } catch (e) {
        this.message = e.message;
        this.messageType = 2;
        this.showMessage = true;
        console.error(e)
      }
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