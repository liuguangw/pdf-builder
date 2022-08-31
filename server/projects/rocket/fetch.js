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
  const doc = await fetchPageDocument(pageURL)
  const contentEl = doc.querySelector('article')
  contentEl.querySelectorAll('a.headerlink').forEach((linkElement) => {
    linkElement.parentElement.removeChild(linkElement)
  })
  return contentEl
}

function parseMenuList(ulElementList, menuList) {
  ulElementList.forEach((ulElement) => {
    /**
     *
     * @type {HTMLAnchorElement}
     */
    let menuLink = ulElement.querySelector('a')
    let menuItem = {
      title: menuLink.innerText,
      url: menuLink.href,
      children: []
    }
    menuList.push(menuItem)
  })
}

;(async () => {
  //获取menu list
  let menuList = []
  let menuNodeList = document.querySelectorAll('#sidebar div.toc>ul')
  parseMenuList(menuNodeList, menuList)
  //console.log(menuList)
  //console.log(JSON.stringify(menuList,null,"\t"))
  await fetchAndSave(menuList, sleepDuration, fetchPage)
})()
