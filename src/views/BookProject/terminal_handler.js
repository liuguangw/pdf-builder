import {Terminal} from "xterm";
import {FitAddon} from "xterm-addon-fit";
import {ref} from "vue";

/**
 *
 * @param {string} msgContent
 * @return {string}
 */
function formatMsgContent(msgContent) {
    //单独的\n -> \r\n
    // \r\n结尾的去掉\r\n
    return msgContent.replace(/(?<!\r)\n/g, "\r\n").replace(/\r\n$/, '')
}

function handleEvents(terminal, projectName, socketClient, canBuild, showSuccessMessage, showErrorMessage) {
    socketClient.on("hello-message", (msgContent) => {
        terminal.writeln(msgContent)
    })
    socketClient.on("save-menu-success", (pName) => {
        if (pName !== projectName) {
            return
        }
        terminal.writeln("\x1B[1;0;32msave menu of " + pName + " success\x1B[0m")
    })
    socketClient.on("fetch-content-error", (pName, progress, title, filename, msgContent) => {
        if (pName !== projectName) {
            return
        }
        terminal.writeln("[\x1B[1;3;31m" + progress + "\x1B[0m]fetch [" + title + " - " + filename + "] error: \x1B[1;0;31m" + msgContent + "\x1B[0m")
    })
    socketClient.on("save-content-success", (pName, progress, title, filename) => {
        if (pName !== projectName) {
            return
        }
        terminal.writeln("[\x1B[1;3;36m" + progress + "\x1B[0m]save [" + title + " - " + filename + "] \x1B[1;0;32msuccess\x1B[0m")
    })
    socketClient.on("save-content-error", (pName, progress, title, filename, msgContent) => {
        if (pName !== projectName) {
            return
        }
        terminal.writeln("[\x1B[1;3;31m" + progress + "\x1B[0m]save [" + title + " - " + filename + "] error: \x1B[1;0;31m" + msgContent + "\x1B[0m")
    })
    socketClient.on("fetch-img-success", (pName, progress, imageURL) => {
        if (pName !== projectName) {
            return
        }
        terminal.writeln("[\x1B[1;3;36m" + progress + "\x1B[0m]fetch " + imageURL + " \x1B[1;0;32msuccess\x1B[0m")
    })
    socketClient.on("fetch-img-skip", (pName, progress, imageURL) => {
        if (pName !== projectName) {
            return
        }
        terminal.writeln("[\x1B[1;3;36m" + progress + "\x1B[0m]fetch " + imageURL + " \x1B[1;0;93mskip\x1B[0m")
    })
    socketClient.on("fetch-img-error", (pName, progress, imageURL, msgContent) => {
        if (pName !== projectName) {
            return
        }
        terminal.writeln("[\x1B[1;3;31m" + progress + "\x1B[0m]fetch " + imageURL + " failed: \x1B[1;0;31m" + msgContent + "\x1B[0m")
    })
    socketClient.on("can-build", (pName) => {
        if (pName !== projectName) {
            return
        }
        canBuild.value = true
    })
    socketClient.on("build-stdout", (pName, msgContent) => {
        if (pName !== projectName) {
            return
        }
        terminal.writeln(formatMsgContent(msgContent))
    })
    socketClient.on("build-stderr", (pName, msgContent) => {
        if (pName !== projectName) {
            return
        }
        terminal.writeln("\x1B[1;0;31m" + formatMsgContent(msgContent) + "\x1B[0m")
    })
    socketClient.on("build-success", (pName) => {
        if (pName !== projectName) {
            return
        }
        terminal.writeln("\x1B[1;0;32mbuild book success\x1B[0m")
        showSuccessMessage("文档构建成功")
    })
    socketClient.on("build-failed", (pName, msgContent) => {
        if (pName !== projectName) {
            return
        }
        terminal.writeln("\x1B[1;0;31m" + msgContent + "\x1B[0m")
        showErrorMessage("文档构建失败")
    })
}

function processInitTerminal(xterm, projectName, socketClient, canBuild, showSuccessMessage, showErrorMessage) {
    //Terminal
    const terminal = new Terminal({
        disableStdin: true
    })
    const fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)
    //初始化 terminal
    terminal.open(xterm.value)
    fitAddon.fit()
    //terminal.writeln("Hello world")
    socketClient.emit("terminal-ready")
    handleEvents(terminal, projectName, socketClient, canBuild, showSuccessMessage, showErrorMessage)
}

export default function useTerminalHandler(showSuccessMessage, showErrorMessage) {
    const canBuild = ref(false);
    return {
        canBuild,
        initTerminal(xterm, projectName, socketClient) {
            processInitTerminal(xterm, projectName, socketClient, canBuild, showSuccessMessage, showErrorMessage)
        }
    }
}
