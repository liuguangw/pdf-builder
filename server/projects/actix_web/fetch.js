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
  let divElement = doc.querySelector('div.actix-content')
  //删除底部的 "Edit on GitHub"
  let gElement = divElement.querySelector('.github-edit')
  if (gElement !== null) {
    gElement.parentElement.removeChild(gElement)
  }
  return divElement
}

function parseMenuList(groupList, menuList) {
  groupList.forEach((groupElement) => {
    let containerElement = groupElement.nextElementSibling
    let subMenuNodeList = containerElement.querySelectorAll('li>a')
    let menuItem = {
      title: groupElement.innerText,
      url: '',
      children: []
    }
    if (menuItem.title === 'API Documentation') {
      return
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
  let groupNodeList = document.querySelectorAll('nav.leftnav>div>h5')
  parseMenuList(groupNodeList, menuList)
  //console.log(menuList)
  //console.log(JSON.stringify(menuList,null,"\t"))
  await fetchAndSave(menuList, sleepDuration, fetchPage)
})()
