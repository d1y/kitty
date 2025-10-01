import { writeFileSync, readFileSync } from "fs"

function getChinaDate() {
  const chinaDate = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
  return chinaDate.replace(/^(\d{2})/, "").replace(/\//g, '/')
}

const kPageUrl = `https://gist.githubusercontent.com/d1y/4d0551fc8105c9d57f85da8cbbdc8b2e/raw/93aa8853c7bc6be7f0c4bde9aec82f2dd59a32b4/fabu.html`

const config = {
  sponsorship: "https://s2.loli.net/2025/09/24/ByRvOsQhWzKLXNo.jpg",
  sourceTotal: 0,
  update: getChinaDate(),
  baseUrl: "https://d1y.github.io/kitty",
}

function getSourceTotal() {
  let total = 0
  const files = ["vod.json", "xvod.json", "x.json", "t4.json"]
  for (const file of files) {
    try {
      const list: any[] = JSON.parse(readFileSync(file, "utf8"))
      total += list.length
    } catch (error) {
      console.error(error)
    }
  }
  return total
}

;(async ()=> {
  const total = getSourceTotal()
  let text = await (await fetch(kPageUrl)).text()
  for (const [key, value] of Object.entries(config)) {
    let realValue = ''+value
    if (key == "sourceTotal") {
      realValue = `${total}`
    }
    text = text.replaceAll(`$$${key}`, realValue)
  }
  const file = process.argv[2]
  writeFileSync(file, text)
})()