/**
 * 暂停一段时间
 *
 * @param {number} ms
 * @return {Promise<void>}
 */
export default function sleepAsync(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}
