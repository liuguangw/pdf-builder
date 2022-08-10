/**
 *
 * @param {ServerResponse} resp
 * @param {any} data
 */
export default function writeJson(resp, data) {
    resp.setHeader("content-type", "application/json")
    resp.end(JSON.stringify(data))
}
