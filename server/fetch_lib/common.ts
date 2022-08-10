export interface PageInfo {
    title: string,
    url: string,
    filename: string,
    deep: number
}

export interface MenuInfo {
    title: string,
    url: string,
    filename?: string,
    children: MenuInfo[]
}

export interface ApiResponse {
    code: number,
    data: any,
    message: string
}

//保存菜单内容的请求
export interface MenuApiRequest {
    bookName: string,
    menuList: any[]
}

export enum FetchStatus {
    Ok,
    HasError = 500
}

//保存网页内容的请求
export interface ContentApiRequest {
    bookName: string,
    title: string,
    filename: string,
    content: string,
    progress: string,
    status: FetchStatus,
    message: string
}

export enum ImageType {
    //普通图片
    Common,
    //使用data url的图片
    DataURL,
    //已经抓取过的相同url图片
    Exists
}

//下载图片的请求
export interface ImageApiRequest {
    bookName: string,
    progress: string,
    url: string,
    imageType: ImageType
}

//下载的图片信息
export interface FetchedImageInfo {
    //图片url
    url: string,
    //下载后的图片名称
    data: string
}

export type FetchPageHandler = (pageURL: string) => Promise<HTMLElement>
export type ReplaceURLHandler = (fullURL: string, contextURL: string) => string
