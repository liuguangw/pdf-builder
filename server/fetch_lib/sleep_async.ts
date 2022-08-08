/**
 * 暂停一段时间
 */
export default function sleepAsync(ms: number): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}
