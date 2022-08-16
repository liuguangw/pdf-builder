//抓取脚本提供的
export interface MenuInfo {
    title: string;
    url: string;
    children: MenuInfo[];
}

//服务端需要的
export interface ServerMenuInfo {
    title: string;
    filename: string;
    children: ServerMenuInfo[];
}
