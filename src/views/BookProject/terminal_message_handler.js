export default function terminalMessageHandler(terminal, socketClient, projectName) {
    socketClient.on("hello-message", (msg) => {
        terminal.writeln(msg);
    });
    socketClient.on("save-menu-success", (pName) => {
        if (pName !== projectName.value) {
            return;
        }
        terminal.writeln("\x1B[1;0;32msave menu of " + pName + " success\x1B[0m");
    });
    socketClient.on("fetch-content-error", (pName, progress, title, filename, message) => {
        if (pName !== projectName.value) {
            return;
        }
        terminal.writeln("[\x1B[1;3;36m" + progress + "\x1B[0m]fetch [" + title + " - " + filename + "] error: \x1B[1;0;31m" + message + "\x1B[0m");
    });
    socketClient.on("save-content-success", (pName, progress, title, filename) => {
        if (pName !== projectName.value) {
            return;
        }
        terminal.writeln("[\x1B[1;3;36m" + progress + "\x1B[0m]save [" + title + " - " + filename + "] \x1B[1;0;32msuccess\x1B[0m");
    });
    socketClient.on("save-content-error", (pName, progress, title, filename, message) => {
        if (pName !== projectName.value) {
            return;
        }
        terminal.writeln("[\x1B[1;3;36m" + progress + "\x1B[0m]save [" + title + " - " + filename + "] error: \x1B[1;0;31m" + message + "\x1B[0m");
    });
    socketClient.on("build-failed", (pName, message) => {
        if (pName !== projectName.value) {
            return;
        }
        terminal.writeln("\x1B[1;0;32m" + message + "\x1B[0m");
    });
    socketClient.on("build-stdout", (pName, message) => {
        if (pName !== projectName.value) {
            return;
        }
        terminal.writeln(message.trimEnd("\n"));
    });
    socketClient.on("build-stderr", (pName, message) => {
        if (pName !== projectName.value) {
            return;
        }
        terminal.writeln("\x1B[1;0;31m" + message.trimEnd("\n") + "\x1B[0m");
    });
}
