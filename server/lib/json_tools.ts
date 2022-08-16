import {IncomingMessage, ServerResponse} from "node:http";

export function readJson<T>(req: IncomingMessage): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        let rawData = '';
        req.on('data', (chunk) => {
            rawData += chunk;
        });
        req.on('end', () => {
            try {
                const parsedData: T = JSON.parse(rawData);
                resolve(parsedData);
            } catch (e) {
                reject(e)
            }
        });
        req.on("error", reject)
    });
}

function writeJson(resp: ServerResponse, data: any) {
    resp.setHeader("content-type", "application/json")
    resp.end(JSON.stringify(data))
}

export function writeSuccessResponse(resp: ServerResponse, data: any = null) {
    const respData = {
        code: 0,
        data,
        message: ""
    }
    writeJson(resp, respData)
}

export function writeErrorResponse(resp: ServerResponse, message: string) {
    const respData = {
        code: 4000,
        data: null,
        message
    }
    writeJson(resp, respData)
}
