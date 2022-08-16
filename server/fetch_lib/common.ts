//下载的图片信息
import { ServerMenuInfo } from '../common/menu_info'

export interface PageInfo {
  title: string
  url: string
  filename: string
  deep: number
}

export interface FetchedImageInfo {
  //图片url
  url: string
  //下载后的图片名称
  data: string
}

export interface ProjectInfo {
  docURL: string
  contextURL: string
  projectName: string
}

export interface ParsePageListResult {
  menuList: ServerMenuInfo[]
  pageList: PageInfo[]
}

export type FetchPageHandler = (pageURL: string) => Promise<HTMLElement>
export type ReplaceURLHandler = (fullURL: string, contextURL: string) => string
