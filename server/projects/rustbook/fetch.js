import fetchAndSave from '../../fetch_lib/fetch_and_save'
import fetchPageDocument from '../../fetch_lib/fetch_page_document'
import { parseMdBookMenuList } from '../../fetch_lib/parse_md_book_menu_list.js'

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
  //代码高亮
  docHighlight(doc)
  //有问题的代码图标
  processFerrises(doc)
  //总结不需要加入pdf目录
  doc.querySelectorAll('h2').forEach((h2Element) => {
    if (h2Element.innerText === '总结') {
      h2Element.classList.add('pdf-no-toc')
    }
  })
  return doc.querySelector('#content main')
}

function docHighlight(doc) {
  let hljs = window.hljs
  // Syntax highlighting Configuration
  hljs.configure({
    tabReplace: '    ', // 4 spaces
    languages: [] // Languages used for auto-detection
  })
  Array.from(doc.querySelectorAll('code')).forEach(function (block) {
    hljs.highlightBlock(block)
  })
  // Adding the hljs class gives code blocks the color css
  // even if highlighting doesn't apply
  Array.from(doc.querySelectorAll('code')).forEach(function (block) {
    block.classList.add('hljs')
  })

  Array.from(doc.querySelectorAll('code.language-rust')).forEach(function (block) {
    let lines = Array.from(block.querySelectorAll('.boring'))
    // If no lines were hidden, return
    if (!lines.length) {
      return
    }
    block.classList.add('hide-boring')

    let buttons = doc.createElement('div')
    buttons.className = 'buttons'
    buttons.innerHTML =
      '<button class="fa fa-expand" title="Show hidden lines" aria-label="Show hidden lines"></button>'

    // add expand button
    let pre_block = block.parentNode
    pre_block.insertBefore(buttons, pre_block.firstChild)
  })

  Array.from(doc.querySelectorAll('pre code')).forEach(function (block) {
    let pre_block = block.parentNode
    if (!pre_block.classList.contains('playpen')) {
      let buttons = pre_block.querySelector('.buttons')
      if (!buttons) {
        buttons = doc.createElement('div')
        buttons.className = 'buttons'
        pre_block.insertBefore(buttons, pre_block.firstChild)
      }

      let clipButton = doc.createElement('button')
      clipButton.className = 'fa fa-copy clip-button'
      clipButton.title = 'Copy to clipboard'
      clipButton.setAttribute('aria-label', clipButton.title)
      clipButton.innerHTML = '<i class="tooltiptext"></i>'

      buttons.insertBefore(clipButton, buttons.firstChild)
    }
  })

  // Process playpen code blocks
  Array.from(doc.querySelectorAll('.playpen')).forEach(function (pre_block) {
    // Add play button
    let buttons = pre_block.querySelector('.buttons')
    if (!buttons) {
      buttons = doc.createElement('div')
      buttons.className = 'buttons'
      pre_block.insertBefore(buttons, pre_block.firstChild)
    }

    let runCodeButton = doc.createElement('button')
    runCodeButton.className = 'fa fa-play play-button'
    runCodeButton.hidden = true
    runCodeButton.title = 'Run this code'
    runCodeButton.setAttribute('aria-label', runCodeButton.title)

    let copyCodeClipboardButton = doc.createElement('button')
    copyCodeClipboardButton.className = 'fa fa-copy clip-button'
    copyCodeClipboardButton.innerHTML = '<i class="tooltiptext"></i>'
    copyCodeClipboardButton.title = 'Copy to clipboard'
    copyCodeClipboardButton.setAttribute('aria-label', copyCodeClipboardButton.title)

    buttons.insertBefore(runCodeButton, buttons.firstChild)
    buttons.insertBefore(copyCodeClipboardButton, buttons.firstChild)

    let code_block = pre_block.querySelector('code')
    if (window.ace && code_block.classList.contains('editable')) {
      let undoChangesButton = doc.createElement('button')
      undoChangesButton.className = 'fa fa-history reset-button'
      undoChangesButton.title = 'Undo changes'
      undoChangesButton.setAttribute('aria-label', undoChangesButton.title)

      buttons.insertBefore(undoChangesButton, buttons.firstChild)
    }
  })
}

function processFerrises(doc) {
  let ferrisTypes = [
    {
      attr: 'does_not_compile',
      title: '这些代码不能编译！'
    },
    {
      attr: 'panics',
      title: '这些代码会 panic！'
    },
    {
      attr: 'unsafe',
      title: '这些代码块包含不安全（unsafe）代码。'
    },
    {
      attr: 'not_desired_behavior',
      title: '这些代码不会产生期望的行为。'
    }
  ]
  for (let ferrisType of ferrisTypes) {
    let elements = doc.getElementsByClassName(ferrisType.attr)
    for (let codeBlock of elements) {
      let lines = codeBlock.textContent.split(/\r|\r\n|\n/).length - 1
      //大于4行则添加小图标
      if (lines >= 4) {
        let a = doc.createElement('a')
        a.setAttribute('href', 'ch00-00-introduction.html#ferris')
        a.setAttribute('target', '_blank')

        let img = doc.createElement('img')
        img.setAttribute('src', 'img/ferris/' + ferrisType.attr + '.svg')
        img.setAttribute('title', ferrisType.title)
        img.className = 'ferris'

        a.appendChild(img)
        codeBlock.parentElement.insertBefore(a, codeBlock)
      }
    }
  }
}

;(async () => {
  //获取menu list
  let menuList = []
  let liElementList = document.querySelectorAll('ol.chapter>li.chapter-item')
  parseMdBookMenuList(liElementList, menuList)
  //console.log(menuList)
  //console.log(JSON.stringify(menuList,null,"\t"))
  await fetchAndSave(menuList, sleepDuration, fetchPage)
})()
