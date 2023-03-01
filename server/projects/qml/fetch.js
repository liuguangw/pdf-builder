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
  let contentEl = doc.querySelector('article>div>div')
  return contentEl
}

function parseMenuList(groupNodeList, menuList) {
  groupNodeList.forEach((groupElement) => {
    let groupAElement = groupElement.querySelector('a')
    let groupTitle = groupAElement.innerText.trim()
    let subMenuNodeList = groupElement.querySelectorAll('ul.sidebar-links>li>a')
    let menuItem = {
      title: groupTitle,
      url: '',
      children: []
    }
    subMenuNodeList.forEach((subMenuEl) => {
      let subMenuItem = {
        title: subMenuEl.innerText.trim(),
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
  let groupNodeList = document.querySelectorAll('nav>ul>li')
  parseMenuList(groupNodeList, menuList)
  //console.log(menuList)
  //console.log(JSON.stringify(menuList,null,"\t"))
  await fetchAndSave(menuList, sleepDuration, fetchPage)
})()
