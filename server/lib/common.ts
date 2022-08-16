export interface BookInfo {
  title: string
  docURL: string
  contextURL: string
  styles: string[]
  projectName?: string
  order?: number
}

export interface MarginOption {
  left: number
  right: number
  top: number
  bottom: number
}

export interface BookMetaInfo {
  title: string
  authors: string
  cover: string
  comments: string
  language: string
  paperSize: string
  tocLevel1: string
  tocLevel2: string
  tocLevel3: string
  marginOption: MarginOption
  headerTpl: string
  footerTpl: string
}
