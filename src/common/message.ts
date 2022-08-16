import { reactive, ToRefs, toRefs } from 'vue'

//普通消息
export const MESSAGE_TYPE_COMMON = 1

//成功消息
export const MESSAGE_TYPE_SUCCESS = 2

//失败消息
export const MESSAGE_TYPE_ERROR = 3

export interface MessageState {
  messageType: number
  message: string
  showMessage: boolean
}

/**
 * 默认的消息状态
 */
export function defaultMessageState(): ToRefs<MessageState> {
  const source: MessageState = {
    messageType: MESSAGE_TYPE_COMMON,
    message: '',
    showMessage: false
  }
  const messageState = reactive(source)
  return toRefs(messageState)
}

export type ShowMessageHandler = (message: string) => void
