/**
 *
 * @param {IncomingMessage} req
 * @param resp
 */
export default function (req, resp) {
    resp.status(404).send(
        "<!DOCTYPE html>\n" +
        "<html lang=\"zh-CN\"><head>\n" +
        "<title>404 Not Found</title>\n" +
        "</head><body>\n" +
        "<h1>Not Found</h1>\n" +
        "<p>The requested URL was not found on this server.</p>\n" +
        "</body></html>");
}
