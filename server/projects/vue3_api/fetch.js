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
  /**
   *
   * @type {HTMLDivElement}
   */
  let divElement = doc.querySelector('main>div>div')
  //删除header-anchor
  let aNodeList = divElement.querySelectorAll('a.header-anchor')
  aNodeList.forEach((aEl) => {
    aEl.parentElement.removeChild(aEl)
  })
  //组合式api
  divElement.className = 'prefer-sfc prefer-composition'
  return divElement
}

function parseMenuList(groupList, menuList) {
  groupList.forEach((groupElement) => {
    /**
     *
     * @type {HTMLElement}
     */
    let groupTitleElement = groupElement.querySelector('.title>h2.title-text')
    let subMenuNodeList = groupElement.querySelectorAll('a.link')
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
  let groupNodeList = document.querySelectorAll('nav>div.group')
  parseMenuList(groupNodeList, menuList)
  //console.log(menuList)
  //console.log(JSON.stringify(menuList,null,"\t"))
  await fetchAndSave(menuList, sleepDuration, fetchPage)
})()
