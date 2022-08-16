import { reactive, toRefs } from 'vue'

//普通消息
export const MESSAGE_TYPE_COMMON = 1

//成功消息
export const MESSAGE_TYPE_SUCCESS = 2

//失败消息
export const MESSAGE_TYPE_ERROR = 3

/**
 * 默认的消息状态
 * @return {Object}
 */
export function defaultMessageState() {
  const messageState = reactive({
    messageType: MESSAGE_TYPE_COMMON,
    message: '',
    showMessage: false
  })
  return toRefs(messageState)
}
