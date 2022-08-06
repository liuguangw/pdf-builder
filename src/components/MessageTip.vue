<template>
  <div :class="['message-card','animate__animated' ,'animate__zoomIn',{
    'with-success':messageType === 1,
    'with-error':messageType === 2
  }]">
    <div class="card-content">{{ message }}</div>
  </div>
</template>

<script>
import {onMounted} from "vue";

export default {
  name: "MessageTip",
  emits: ['dialog-close'],
  props: {
    message: {
      type: String,
      required: true
    },
    /*0普通消息 1成功消息 2失败消息*/
    messageType: {
      type: Number,
      default() {
        return 0;
      }
    }
  },
  setup(props, context) {
    onMounted(() => {
      setTimeout(() => {
        context.emit("dialog-close")
      }, 2200)
    });
  }
}
</script>

<style lang="scss" scoped>
.message-card {
  width: 600px;
  left: 50%;
  top: 50px;
  margin-left: -300px;
  position: absolute;
  display: block;
  border: 1px solid #ccc;
  border-radius: 5px;
  z-index: 202;
  --animate-duration: 300ms;

  .card-content {
    padding: 8px 16px;
    color: #41464b;
    background-color: #e2e3e5;
    border: 1px solid #d3d6d8;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  }

  &.with-success .card-content {
    color: #0f5132;
    background-color: #d1e7dd;
    border-color: #badbcc;
  }

  &.with-error .card-content {
    color: #842029;
    background-color: #f8d7da;
    border-color: #f5c2c7;
  }
}
</style>
