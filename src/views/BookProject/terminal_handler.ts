import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { Ref, ref } from 'vue'
import { ShowMessageHandler } from '../../common/message'
import { Socket } from 'socket.io-client'

/**
 *
 */
function formatMsgContent(msgContent: string): string {
  //单独的\n -> \r\n
  // \r\n结尾的去掉\r\n
  return msgContent.replace(/(?<!\r)\n/g, '\r\n').replace(/\r\n$/, '')
}

function handleEvents(
  terminal: Terminal,
  projectName: string,
  socketClient: Socket,
  canBuild: Ref<boolean>,
  showSuccessMessage: ShowMessageHandler,
  showErrorMessage: ShowMessageHandler
) {
  socketClient.on('hello-message', (msgContent: string) => {
    terminal.writeln(msgContent)
  })
  socketClient.on('save-menu-success', (pName: string) => {
    if (pName !== projectName) {
      return
    }
    terminal.writeln('\x1B[1;0;32msave menu of ' + pName + ' success\x1B[0m')
  })
  socketClient.on(
    'fetch-content-error',
    (pName: string, progress: string, title: string, filename: string, msgContent: string) => {
      if (pName !== projectName) {
        return
      }
      terminal.writeln(
        '[\x1B[1;3;31m' +
          progress +
          '\x1B[0m]fetch [' +
          title +
          ' - ' +
          filename +
          '] error: \x1B[1;0;31m' +
          msgContent +
          '\x1B[0m'
      )
    }
  )
  socketClient.on('save-content-success', (pName: string, progress: string, title: string, filename: string) => {
    if (pName !== projectName) {
      return
    }
    terminal.writeln(
      '[\x1B[1;3;36m' + progress + '\x1B[0m]save [' + title + ' - ' + filename + '] \x1B[1;0;32msuccess\x1B[0m'
    )
  })
  socketClient.on(
    'save-content-error',
    (pName: string, progress: string, title: string, filename: string, msgContent: string) => {
      if (pName !== projectName) {
        return
      }
      terminal.writeln(
        '[\x1B[1;3;31m' +
          progress +
          '\x1B[0m]save [' +
          title +
          ' - ' +
          filename +
          '] error: \x1B[1;0;31m' +
          msgContent +
          '\x1B[0m'
      )
    }
  )
  socketClient.on('fetch-img-success', (pName: string, progress: string, imageURL: string) => {
    if (pName !== projectName) {
      return
    }
    terminal.writeln('[\x1B[1;3;36m' + progress + '\x1B[0m]fetch ' + imageURL + ' \x1B[1;0;32msuccess\x1B[0m')
  })
  socketClient.on('fetch-img-skip', (pName: string, progress: string, imageURL: string) => {
    if (pName !== projectName) {
      return
    }
    terminal.writeln('[\x1B[1;3;36m' + progress + '\x1B[0m]fetch ' + imageURL + ' \x1B[1;0;93mskip\x1B[0m')
  })
  socketClient.on('fetch-img-error', (pName, progress, imageURL, msgContent) => {
    if (pName !== projectName) {
      return
    }
    terminal.writeln(
      '[\x1B[1;3;31m' + progress + '\x1B[0m]fetch ' + imageURL + ' failed: \x1B[1;0;31m' + msgContent + '\x1B[0m'
    )
  })
  socketClient.on('can-build', (pName: string) => {
    if (pName !== projectName) {
      return
    }
    canBuild.value = true
  })
  socketClient.on('build-stdout', (pName: string, msgContent: string) => {
    if (pName !== projectName) {
      return
    }
    terminal.writeln(formatMsgContent(msgContent))
  })
  socketClient.on('build-stderr', (pName: string, msgContent: string) => {
    if (pName !== projectName) {
      return
    }
    terminal.writeln('\x1B[1;0;31m' + formatMsgContent(msgContent) + '\x1B[0m')
  })
  socketClient.on('build-success', (pName: string) => {
    if (pName !== projectName) {
      return
    }
    terminal.writeln('\x1B[1;0;32mbuild book success\x1B[0m')
    showSuccessMessage('文档构建成功')
  })
  socketClient.on('build-failed', (pName: string, msgContent: string) => {
    if (pName !== projectName) {
      return
    }
    terminal.writeln('\x1B[1;0;31m' + msgContent + '\x1B[0m')
    showErrorMessage('文档构建失败')
  })
}

function processInitTerminal(
  xterm: HTMLElement,
  projectName: string,
  socketClient: Socket,
  canBuild: Ref<boolean>,
  showSuccessMessage: ShowMessageHandler,
  showErrorMessage: ShowMessageHandler
) {
  //Terminal
  const terminal = new Terminal({
    disableStdin: true
  })
  const fitAddon = new FitAddon()
  terminal.loadAddon(fitAddon)
  //初始化 terminal
  terminal.open(xterm)
  fitAddon.fit()
  //terminal.writeln("Hello world")
  socketClient.emit('terminal-ready')
  handleEvents(terminal, projectName, socketClient, canBuild, showSuccessMessage, showErrorMessage)
}

export default function useTerminalHandler(
  showSuccessMessage: ShowMessageHandler,
  showErrorMessage: ShowMessageHandler
) {
  const canBuild = ref(false)
  return {
    canBuild,
    initTerminal(xterm: HTMLElement, projectName: string, socketClient: Socket) {
      processInitTerminal(xterm, projectName, socketClient, canBuild, showSuccessMessage, showErrorMessage)
    }
  }
}
