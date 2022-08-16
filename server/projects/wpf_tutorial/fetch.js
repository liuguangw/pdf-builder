import fetchAndSave from '../../fetch_lib/fetch_and_save'
import fetchPageDocument from '../../fetch_lib/fetch_page_document'

//抓取页面的间隔时间(ms)
const sleepDuration = 2300

/**
 * 抓取页面
 *
 * @param {string} pageURL
 * @return {Promise<HTMLDivElement>}
 */
async function fetchPage(pageURL) {
  let doc = await fetchPageDocument(pageURL)
  let contentEl = doc.querySelector('#content>article')
  //删除一些无关内容
  let selectors = [
    'script',
    'hr',
    '.adsbygoogle',
    '#chapter-title',
    '#divArticleAvailableLanguages',
    '#bottom-ad',
    '#bottom-navigation'
  ]
  contentEl.querySelectorAll(selectors.join(',')).forEach((nodeElement) => {
    nodeElement.parentElement.removeChild(nodeElement)
  })
  //代码高亮
  contentEl.querySelectorAll('pre>code').forEach((codeElement) => {
    window.hljs.highlightBlock(codeElement)
  })
  return contentEl
}

function parseMenuList(groupNodeList, menuList) {
  groupNodeList.forEach((groupElement) => {
    let groupTitleElement = groupElement.querySelector('h3')
    let nextElement = groupTitleElement.nextElementSibling
    if (nextElement.tagName.toLowerCase() !== 'ul') {
      return
    }
    let subMenuNodeList = nextElement.querySelectorAll('li>a')
    let menuItem = {
      title: groupTitleElement.innerText,
      url: '',
      children: []
    }
    subMenuNodeList.forEach((subMenuEl) => {
      let subMenuItem = {
        title: subMenuEl.innerText,
        url: subMenuEl.href,
        children: []
      }
      menuItem.children.push(subMenuItem)
    })
    menuList.push(menuItem)
  })
}

;(async () => {
  //获取menu list
  let menuList = []
  let groupNodeList = document.querySelectorAll('#sidebar>#toc>div.chapter')
  parseMenuList(groupNodeList, menuList)
  //console.log(menuList)
  //console.log(JSON.stringify(menuList,null,"\t"))
  await fetchAndSave(menuList, sleepDuration, fetchPage)
})()
