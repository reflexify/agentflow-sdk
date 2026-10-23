import { spawn } from "node:child_process";
export function openInBrowser(url) {
    const [command, args] = process.platform === "darwin"
        ? ["open", [url]]
        : process.platform === "win32"
            ? ["cmd", ["/c", "start", "", url]]
            : ["xdg-open", [url]];
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, { stdio: "ignore", detached: true });
        child.once("error", reject);
        child.once("spawn", () => {
            child.unref();
            resolve();
        });
    });
}
//# sourceMappingURL=browser.js.map