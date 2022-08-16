import { ServerMenuInfo } from './menu_info'

export interface ApiRequest {
  bookName: string
}

//保存菜单内容的请求
export interface MenuApiRequest extends ApiRequest {
  menuList: ServerMenuInfo[]
}

export enum FetchStatus {
  Ok,
  HasError = 500
}

//保存网页内容的请求
export interface ContentApiRequest extends ApiRequest {
  title: string
  filename: string
  content: string
  progress: string
  status: FetchStatus
  message: string
}

//图片类型
export enum ImageType {
  //普通图片
  Common,
  //使用data url的图片
  DataURL,
  //已经抓取过的相同url图片
  Exists
}

//下载图片的请求
export interface ImageApiRequest extends ApiRequest {
  progress: string
  url: string
  imageType: ImageType
}
