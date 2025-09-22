// import { kitty, req, createTestEnv } from 'utils'

export default class xiaoyakankan implements Handle {
  getConfig() {
    return <Iconfig>{
      id: 'xiaoyakankan',
      name: '小鸭看看',
      api: "https://xiaoyakankan.com",
      type: 1,
      nsfw: false,
    }
  }
  async getCategory() {
    // TODO(d1y): 上游的分类最好能够支持显示图标?
    // > 添加一个 extra['icon']
    return <ICategory[]>[
      { text: "电影", id: "10" },
      { text: "连续剧", id: "11" },
      { text: "综艺", id: "12" },
      { text: "动漫", id: "13" },
      { text: "福利", id: "15" },
    ]
  }
  async getHome() {
    const cate = env.get("category")
    const page = env.get("page")
    const url = `${env.baseUrl}/cat/${cate}-${page}.html`
    const html = await req(url)
    const $ = kitty.load(html)
    return $(".m4-list .item").toArray().map<IMovie>(item => {
      const img = $(item).find("img.img")
      const id = $(item).find("a.link").attr("href") ?? ""
      const title = img.attr("alt") ?? ""
      const cover = img.attr("data-src") ?? ""
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
    const cover = img.attr("src") ?? ""
    const title = img.attr("alt") ?? ""
    const playlist: IPlaylist[] = []
    for (const script of $("body script").toArray()) {
      let cx = $(script).text() ?? ""
      if (!cx || !cx.includes("var pp")) continue
      cx = cx.replace("var pp=", "")
      if (cx.endsWith(";")) cx = cx.slice(0, -1)//删除结尾的分号
      // FIXME(d1y): 我不确定上游的 flutter_js 支不支持执行 eval
      // 如果不支持的话, 最好的方法在上游暴露一个 $eval 方法
      // 在 dart 端处理了之后, 返回给 JS 在做后续的处理
      /** @type {{ lines: Array<[null, string, null, [string]]> }} */
      const unsafeJSObj = eval(`(${cx})`)
      for (const line of unsafeJSObj.lines) {
        const text = line[1]
        const url = line[3][0]
        playlist.push({ text, url })
      }
    }
    return <IMovie>{
      id,
      title,
      cover,
      remark: "",
      playlist,
    }
  }
}

// TEST
// const env = createTestEnv("https://xiaoyakankan.com")
// const xy = new xiaoyakankan()
// ;(async () => {
//   const cate = await xy.getCategory()
//   env.set("category", cate[0].id)
//   env.set("page", 1)
//   const home = await xy.getHome()
//   env.set("movieId", home[0].id)
//   const detail = await xy.getDetail()
//   debugger
// })()