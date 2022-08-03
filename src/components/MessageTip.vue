<template>
  <div :class="['message-card',{
    'error':messageType === 1
  }]">
    <div class="card-title"><h4>{{ messageTitle }}</h4></div>
    <div class="card-body">
      <div class="card-content">{{ message }}</div>
    </div>
  </div>
</template>

<script>
import {onMounted} from "vue";

export default {
  name: "MessageTip",
  emits: ['dialog-close'],
  props: {
    title: {
      type: String,
      default() {
        return ""
      }
    },
    message: {
      type: String,
      required: true
    },
    messageType: {
      type: Number,
      default() {
        return 0;
      }
    }
  },
  setup(props,context){
    onMounted(()=>{
      setTimeout(()=>{
        context.emit("dialog-close")
      },2500)
    });
  },
  computed: {
    messageTitle() {
      if (this.title !== "") {
        return this.title
      }
      if (this.messageType === 0) {
        return "消息提示"
      } else if (this.messageType === 1) {
        return "出错了"
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.message-card{
  background: #ffffff;
  width: 600px;
  left: 50%;
  top: 20px;
  margin-left: -300px;
  position: absolute;
  display: block;
  border: 1px solid #ccc;
  border-radius: 5px;
  z-index: 20;
  .card-title{
    text-align: center;
    padding: 10px 0;
    background: #ededed;
    h4{
      margin: 0;
    }
  }
  .card-body{
    padding: 26px 20px;
  }
  &.error .card-title{
    background: #f1d6d6;
  }
  &.error .card-body{
    color: red;
   }
}
</style>
