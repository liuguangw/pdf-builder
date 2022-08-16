/**
 * 加载一个远程js
 * @param scriptURL
 * @return {Promise<void>}
 */
export default function loadScript(scriptURL) {
  return new Promise((resolve, reject) => {
    const sc = document.createElement('script')
    sc.type = 'text/javascript'
    sc.src = scriptURL
    sc.addEventListener('load', resolve)
    sc.addEventListener('error', (e) => {
      reject(e)
    })
    document.body.appendChild(sc)
  })
}
