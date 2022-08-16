<template>
  <div class="source-dialog-wrapper">
    <div class="dialog animate__animated animate__backInUp">
      <div class="dialog-header">
        <span class="dialog-title">抓取脚本</span>
        <a href="#" class="close-btn" title="关闭" @click="$emit('dialog-close')">x</a>
      </div>
      <div class="dialog-body">
        <div class="alert-info">
          <span class="alert-title">将以下代码复制到目标文档页的控制台,执行即可进行数据抓取.</span>
        </div>
        <div class="dialog-row">
          <div class="dialog-row-col dialog-row-col-4">
            <button class="btn btn-primary" type="button" @click="copyCode">
              <span>复制代码</span>
            </button>
          </div>
          <div class="dialog-row-col dialog-row-col-16">
            <p>
              目标文档地址: <a :href="docUrl" target="_blank">{{ docUrl }}</a>
            </p>
          </div>
          <div class="dialog-row-col dialog-row-col-4">
            <button class="btn btn-danger" type="button" @click="$emit('build-book')">
              <span>强制构建</span>
            </button>
          </div>
        </div>
        <div class="dialog-textarea">
          <highlight-js language="js" :code="sourceContent" />
        </div>
      </div>
    </div>
  </div>
  <teleport to="body">
    <div class="dialog-modal"></div>
  </teleport>
</template>

<script setup lang="ts">
import 'highlight.js/styles/stackoverflow-light.css'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import hljsVuePlugin from '@highlightjs/vue-plugin'

hljs.registerLanguage('javascript', javascript)
const HighlightJs = hljsVuePlugin.component
const emit = defineEmits(['dialog-close', 'copy-success', 'copy-error', 'build-book'])
const props = defineProps({
  projectName: {
    type: String,
    required: true
  },
  docUrl: {
    type: String,
    required: true
  },
  sourceContent: {
    type: String,
    required: true
  }
})

async function copyCode() {
  try {
    await navigator.clipboard.writeText(props.sourceContent)
  } catch (err) {
    const typedError = err as Error
    emit('copy-error', typedError.message)
    return
  }
  emit('copy-success')
}
</script>

<style lang="scss" scoped>
.dialog-modal {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0.5;
  background: #000;
  z-index: 200;
}

.source-dialog-wrapper {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: auto;
  margin: 0;
  z-index: 201;

  .dialog {
    margin: 15vh auto 50px auto;
    background: #fff;
    border-radius: 2px;
    box-shadow: 0 1px 3px rgb(0 0 0 / 30%);
    box-sizing: border-box;
    width: 50%;
    --animate-duration: 300ms;

    .dialog-header {
      padding: 20px;
      text-align: center;
      position: relative;

      .dialog-title {
        line-height: 24px;
        font-size: 18px;
        color: #303133;
      }

      .close-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        padding: 5px;
        outline: 0;
        cursor: pointer;
        font-size: 14px;
        color: #ffffff;
        background-color: #f56c6c;
        width: 20px;
        height: 20px;
        line-height: 20px;
        border-radius: 50%;
        border: 1px solid #ccc;
        display: block;
        text-decoration: none;

        &:hover {
          background-color: #f78989;
          border-color: #f78989;
        }
      }
    }

    .dialog-body {
      padding: 10px 20px 20px 20px;
      color: #606266;
      font-size: 14px;
      word-break: break-all;

      .alert-info {
        background-color: #f4f4f5;
        color: #909399;
        width: 100%;
        padding: 8px 16px;
        margin: 0;
        box-sizing: border-box;
        border-radius: 4px;
        position: relative;
        overflow: hidden;
        opacity: 1;
        display: flex;
        align-items: center;
        transition: opacity 0.2s;
      }

      .dialog-row {
        margin-top: 8px;
        position: relative;

        &:after {
          content: '';
          display: table;
          clear: both;
        }

        .dialog-row-col {
          float: left;

          &.dialog-row-col-4 {
            width: 16.66667%;
          }

          &.dialog-row-col-16 {
            width: 66.66667%;
          }
        }

        button.btn {
          display: inline-block;
          line-height: 1;
          white-space: nowrap;
          cursor: pointer;
          background: #fff;
          border: 1px solid #dcdfe6;
          color: #606266;
          -webkit-appearance: none;
          text-align: center;
          box-sizing: border-box;
          outline: 0;
          margin: 0;
          transition: 0.1s;
          font-weight: 500;
          font-size: 14px;
          border-radius: 20px;
          padding: 12px 23px;
          outline: none;

          &:hover {
            color: #409eff;
            border-color: #c6e2ff;
            background-color: #ecf5ff;
          }

          &.btn-primary {
            color: #fff;
            background-color: #409eff;
            border-color: #409eff;

            &:hover {
              background: #66b1ff;
              border-color: #66b1ff;
              color: #fff;
            }

            &:active {
              background: #3a8ee6;
              border-color: #3a8ee6;
              color: #fff;
            }
          }

          &.btn-danger {
            color: #fff;
            background-color: #f56c6c;
            border-color: #f56c6c;

            &:hover {
              background: #f78989;
              border-color: #f78989;
              color: #fff;
            }

            &:active {
              background: #dd6161;
              border-color: #dd6161;
              color: #fff;
            }
          }
        }

        a {
          text-decoration: none;
          color: #2196f3;

          &:hover {
            color: red;
            text-decoration: underline;
          }
        }
      }

      .dialog-textarea {
        margin-top: 15px;
        width: 100%;
        font-size: 16px;
        border: 1px solid #d5cdcd;
        border-radius: 8px;
        overflow: hidden;

        &:deep(pre) {
          margin: 0;
          white-space: pre-wrap;

          code {
            height: 450px;
            overflow: auto;
          }
        }
      }
    }
  }
}
</style>
