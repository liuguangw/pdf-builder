export default class ApiEndpoint {
  private readonly apiPrefix: string

  constructor(public readonly projectName: string) {
    // @ts-expect-error: 这里会被替换
    this.apiPrefix = VITE_SERVER_URL
  }

  get menuApiURL(): string {
    return this.apiPrefix + '/api/book-menu-info'
  }

  get contentApiURL(): string {
    return this.apiPrefix + '/api/book-content'
  }

  get imageApiURL(): string {
    return this.apiPrefix + '/api/book-images'
  }

  get notifyApiURL(): string {
    return this.apiPrefix + '/api/book-can-build'
  }
}
