<template>
  <div class="source-dialog-wrapper">
    <div class="dialog animate__animated animate__backInUp">
      <div class="dialog-header">
        <span class="dialog-title">抓取脚本</span>
        <button type="button" title="关闭" @click="$emit('dialog-close')">x</button>
      </div>
      <div class="dialog-body">
        <div class="alert-info">
          <span class="alert-title">将以下代码复制到目标文档页的控制台,执行即可进行数据抓取.</span>
        </div>
        <div class="dialog-row">
          <div class="dialog-row-col dialog-row-col-4">
            <button class="btn btn-primary" type="button" @click="copyCode"><span>复制代码</span></button>
          </div>
          <div class="dialog-row-col dialog-row-col-16"><p>目标文档地址: <a :href="docUrl"
                                                                      target="_blank">{{ docUrl }}</a>
          </p></div>
          <div class="dialog-row-col dialog-row-col-4">
            <button class="btn btn-danger" type="button" @click="buildBook"><span>强制构建</span></button>
          </div>
        </div>
        <div class="dialog-textarea">
          <textarea readonly="readonly" autocomplete="off" rows="15" placeholder="请输入内容"
                    v-model="sourceContent"></textarea>
        </div>
      </div>
    </div>
  </div>
  <teleport to="body">
    <div class="dialog-modal"></div>
  </teleport>
</template>

<script>
import axios from "axios";

export default {
  name: "SourceDialog",
  emits: ["dialog-close", "copy-success"],
  props: {
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
  },
  methods: {
    async copyCode() {
      await navigator.clipboard.writeText(this.sourceContent);
      this.$emit("copy-success");
    },
    async buildBook() {
      try {
        let buildResult = await axios.post("/api/books/" + this.projectName + "/build")
        let buildResponse = buildResult.data
        if (buildResponse.code !== 0) {
          console.error(buildResponse.message)
        } else {
          console.log("send build command ok")
        }
        this.$emit("dialog-close")
      } catch (e) {
        console.error(e)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog-modal {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: .5;
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
    position: relative;
    margin: 15vh auto 50px auto;
    background: #fff;
    border-radius: 2px;
    box-shadow: 0 1px 3px rgb(0 0 0 / 30%);
    box-sizing: border-box;
    width: 50%;
    --animate-duration: 300ms;

    .dialog-header {
      padding: 20px 20px 10px;
      text-align: center;

      .dialog-title {
        line-height: 24px;
        font-size: 18px;
        color: #303133;
      }

      button {
        position: absolute;
        top: 20px;
        right: 20px;
        padding: 0;
        background: 0 0;
        border: none;
        outline: 0;
        cursor: pointer;
        font-size: 16px;
        color: #909399;
        width: 16px;
        height: 16px;
        line-height: 16px;

        &:hover {
          color: #409eff;
        }
      }
    }

    .dialog-body {
      padding: 30px 20px;
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
        transition: opacity .2s;
      }

      .dialog-row {
        margin-top: 8px;
        position: relative;

        &:after {
          content: "";
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
          transition: .1s;
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
        position: relative;
        display: inline-block;
        width: 100%;
        vertical-align: bottom;
        font-size: 14px;

        textarea {
          min-height: 33px;
          display: block;
          resize: vertical;
          padding: 5px 15px;
          line-height: 1.5;
          box-sizing: border-box;
          width: 100%;
          font-size: inherit;
          color: #606266;
          background-color: #fff;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          transition: border-color .2s cubic-bezier(.645, .045, .355, 1);

          &:focus {
            outline: 0;
            border-color: #409eff;
          }
        }
      }
    }
  }
}
</style>
