import { kitty, req, createTestEnv } from 'utils'

export default class xiaoyakankan implements Handle {
  getConfig() {
    return <Iconfig>{
      id: 'xiaoyakankan',
      name: '小鸭看看',
      api: "https://xiaoyakankan.com",
      type: 1,
      nsfw: false,
      extra: {
        gfw: true
      }
    }
  }
  async getCategory() {
    return <ICategory[]>[
      { text: "首页", id: "/" },
      { text: "电影", id: "10" },
      { text: "连续剧", id: "11" },
      { text: "综艺", id: "12" },
      { text: "动漫", id: "13" },
      { text: "福利", id: "15" },
    ]
  }
  async getHome() {
    const cate = env.get("category")
    if (cate == "/") {
      const $ = kitty.load(await req(env.baseUrl))
      const titles = $(".m4-main .m4-meta").toArray().map(item => {
        return $(item).find("h3").text().trim()
      })
      const videos = $(".m4-main .m4-list").toArray().map(item => {
        return $(item).find(".item").toArray().map(subItem => {
          const id = $(subItem).find("a.link").attr("href") ?? ""
          const title = $(subItem).find("a.title").text().trim()
          const remark = $(subItem).find(".tag2").text() ?? ""
          let cover = $(subItem).find("img.img").attr("data-src") ?? ""
          if (!!cover && cover.startsWith("//")) {
            cover = `https:${cover}`
          }
          return <IMovie>{ id, title, cover, remark }
        })
      })
      const list = titles.map((title, index) => {
        return <IHomeContentItem>{
          type: "list",
          title,
          videos: videos[index]
        }
      })
      return <IHomeData>{
        type: "complex",
        data: [
          {
            type: "markdown", extra: {
              markdown: `
> 欢迎使用小猫影视(${kitty.VERSION})
> 该源仅做测试使用，不可用于其他用途
> 飞机交流群: https://t.me/catmovie1145
> 小猫其他指南: https://xmpro.netlify.app
`
            }
          },
          ...list,
        ]
      }
    }
    const page = env.get("page")
    const url = `${env.baseUrl}/cat/${cate}-${page}.html`
    const html = await req(url)
    const $ = kitty.load(html)
    return $(".m4-list .item").toArray().map<IMovie>(item => {
      const img = $(item).find("img.img")
      const id = $(item).find("a.link").attr("href") ?? ""
      const title = img.attr("alt") ?? ""
      let cover = img.attr("data-src") ?? ""
      if (!!cover && cover.startsWith("//")) {
        cover = `https:${cover}`
      }
      const remark = $(item).find(".tag1").text() ?? ""
      return { id, title, cover, remark, playlist: [] }
    })
  }
  async getDetail() {
    const id = env.get("movieId")
    const url = `${env.baseUrl}${id}`
    const html = await req(url)
    const $ = kitty.load(html)
    const div = $(".m4-vod")
    const img = div.find("img.img")
    let cover = img.attr("src") ?? ""
    if (!!cover && cover.startsWith("//")) {
      cover = `https:${cover}`
    }
    let desc = $(".more .info:last-of-type").text() ?? ""
    const kPrefix = "简介："
    if (desc.startsWith(kPrefix)) {
      desc = desc.replace(kPrefix, "")
    } else {
      desc = ""
    }
    const playlist: IPlaylist[] = []
    for (const script of $("body script").toArray()) {
      let cx = $(script).text() ?? ""
      if (!cx || !cx.includes("var pp")) continue
      cx = cx.replace("var pp=", "")
      if (cx.endsWith(";")) cx = cx.slice(0, -1)//删除结尾的分号
      const unsafeJSObj: {
        lines: Array<
          [string, string, string, string[]]
        >
      } = eval(`(${cx})`)
      for (const line of unsafeJSObj.lines) {
        const _id = line[0]
        const text = line[1]
        const urls = line[3]
        const videos = $(`div[data-vod='${_id}'] .list a`).toArray().map((item, index) => {
          const text = $(item).text().trim()
          const idx = +($(item).attr("data-sou_idx") ?? "0")
          const realUrl = urls[idx]
          return <IPlaylistVideo>{ text, url: realUrl }
        })
        playlist.push({ title: text, videos })
      }
    }
    return <IMovie>{ cover, desc, playlist }
  }
}

const env = createTestEnv("https://xiaoyakankan.com")
const xy = new xiaoyakankan();
(async () => {
  const cate = await xy.getCategory()
  env.set("category", cate[1].id)
  env.set("page", 1)
  const home = await xy.getHome()
  if (!Array.isArray(home)) return
  env.set("movieId", home[0].id)
  const detail = await xy.getDetail()
  debugger
})()