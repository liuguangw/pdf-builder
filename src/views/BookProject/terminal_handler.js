import {Terminal} from "xterm";
import {FitAddon} from "xterm-addon-fit";
import {ref} from "vue";

function handleEvents(socketClient, terminal, projectName, canBuild, showMessage, messageType, message) {
    socketClient.on("hello-message", (msgContent) => {
        terminal.writeln(msgContent);
    });
    socketClient.on("save-menu-success", (pName) => {
        if (pName !== projectName.value) {
            return;
        }
        terminal.writeln("\x1B[1;0;32msave menu of " + pName + " success\x1B[0m");
    });
    socketClient.on("fetch-content-error", (pName, progress, title, filename, msgContent) => {
        if (pName !== projectName.value) {
            return;
        }
        terminal.writeln("[\x1B[1;3;31m" + progress + "\x1B[0m]fetch [" + title + " - " + filename + "] error: \x1B[1;0;31m" + msgContent + "\x1B[0m");
    });
    socketClient.on("save-content-success", (pName, progress, title, filename) => {
        if (pName !== projectName.value) {
            return;
        }
        terminal.writeln("[\x1B[1;3;36m" + progress + "\x1B[0m]save [" + title + " - " + filename + "] \x1B[1;0;32msuccess\x1B[0m");
    });
    socketClient.on("save-content-error", (pName, progress, title, filename, msgContent) => {
        if (pName !== projectName.value) {
            return;
        }
        terminal.writeln("[\x1B[1;3;31m" + progress + "\x1B[0m]save [" + title + " - " + filename + "] error: \x1B[1;0;31m" + msgContent + "\x1B[0m");
    });
    socketClient.on("save-img-success", (pName, progress, imageURL) => {
        if (pName !== projectName.value) {
            return;
        }
        terminal.writeln("[\x1B[1;3;36m" + progress + "\x1B[0m]fetch " + imageURL + " \x1B[1;0;32msuccess\x1B[0m");
    });
    socketClient.on("save-img-error", (pName, progress, imageURL, msgContent) => {
        if (pName !== projectName.value) {
            return;
        }
        terminal.writeln("[\x1B[1;3;31m" + progress + "\x1B[0m]fetch " + imageURL + " failed: \x1B[1;0;31m" + msgContent + "\x1B[0m");
    });
    socketClient.on("can-build", (pName) => {
        if (pName !== projectName.value) {
            return;
        }
        canBuild.value = true
    });
    socketClient.on("build-stdout", (pName, msgContent) => {
        if (pName !== projectName.value) {
            return;
        }
        terminal.writeln(msgContent.trimEnd("\n"));
    });
    socketClient.on("build-stderr", (pName, msgContent) => {
        if (pName !== projectName.value) {
            return;
        }
        terminal.writeln("\x1B[1;0;31m" + msgContent.trimEnd("\n") + "\x1B[0m");
    });
    socketClient.on("build-success", (pName) => {
        if (pName !== projectName.value) {
            return;
        }
        terminal.writeln("\x1B[1;0;32mbuild book success\x1B[0m");
        message.value = "文档构建成功";
        messageType.value = 1;
        showMessage.value = true;
    });
    socketClient.on("build-failed", (pName, msgContent) => {
        if (pName !== projectName.value) {
            return;
        }
        terminal.writeln("\x1B[1;0;31m" + msgContent + "\x1B[0m");
        message.value = "文档构建失败";
        messageType.value = 2;
        showMessage.value = true;
    });
}

export default function useTerminalHandler() {
    const canBuild = ref(false);
    const initTerminal = function (xterm, projectName, socketClient, showMessage, messageType, message) {
        //Terminal
        const terminal = new Terminal({
            disableStdin: true
        });
        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);
        //初始化 terminal
        terminal.open(xterm.value);
        fitAddon.fit();
        //terminal.writeln("Hello world");
        socketClient.emit("terminal-ready");
        handleEvents(socketClient, terminal, projectName, canBuild, showMessage, messageType, message);
    }
    return {
        canBuild,
        initTerminal
    }
}