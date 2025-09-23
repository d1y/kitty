// import { kitty, req, createTestEnv } from 'utils'

export default class feituys implements Handle {
  getConfig() {
    return <Iconfig>{
      id: "feituys",
      name: "飞天影视",
      api: "https://www.feitu.tv",
      nsfw: false,
      type: 1,
    }
  }
  async getCategory() {
    return <ICategory[]>[
      { text: "电影", id: "1" },
      { text: "连续剧", id: "2" },
      { text: "综艺", id: "3" },
      { text: "动漫", id: "4" },
      { text: "超爽短剧", id: "110" },
    ]
  }
  async getHome() {
    const cate = env.get("category")
    const page = env.get("page")
    const url = `${env.baseUrl}/filter/${cate}/page/${page}`
    const html = await req(url)
    const $ = kitty.load(html)
    return $(".hl-vod-list li").toArray().map<IMovie>(item => {
      const a = $(item).find("a")
      const title = a.attr("title") ?? ""
      const id = a.attr("href") ?? ""
      const cover = a.attr("data-original") ?? ""
      const remark = a.find(".hl-lc-1.remarks").text() ?? ""
      return { id, title, cover, remark }
    })
  }
  async getDetail() {
    const id = env.get("movieId")
    const url = `${env.baseUrl}${id}`
    const html = await req(url)
    const $ = kitty.load(html)
    const span = $(".hl-dc-pic .hl-item-thumb.hl-lazy")
    const cover = span.attr("data-original") ?? ""
    const title = span.attr("title") ?? ""
    const tabs = $(".hl-plays-from a").toArray().map(item => {
      return $(item).text().trim()
    })
    const map = $(".hl-tabs-box").toArray().map(item => {
      return $(item).find("a").toArray().map(item => {
        const text = $(item).text() ?? ""
        const id = $(item).attr("href") ?? ""
        return <IPlaylistVideo>{ id, text }
      })
    })
    const playlist = tabs.map((title, index) => {
      const videos = map[index]
      return <IPlaylist>{ title, videos }
    })
    let desc = ""
    {
      const _ = $(".hl-full-box li").toArray().at(-1)
      let text = $(_).text() ?? ""
      if (text.startsWith("简介")) {
        text = text.replace("简介：", "")
        if (text != "暂无简介") {
          desc = text
        }
      }
    }
    return <IMovie>{ id, cover, title, desc, playlist }
  }
  async getSearch() {
    const page = env.get<string>("page")
    const wd = env.get("keyword")
    const url = `${env.baseUrl}/search/${wd}-${page}/`
    const html = await req(url)
    const $ = kitty.load(html)
    return $(".hl-one-list li").toArray().map<IMovie>(item => {
      const a = $(item).find("a")
      const id = a.attr("href") ?? ""
      const title = a.attr("title") ?? ""
      const cover = a.attr("data-original") ?? ""
      const remark = $(item).find(".hl-text-conch.score").text() ?? ""
      return { id, title, cover, remark }
    })
  }
  async parseIframe() {
    return kitty.utils.getM3u8WithIframe(env)
  }
}

// TEST
// const env = createTestEnv("https://www.feitu.tv")
// const tv = new feituys();
// (async () => {
//   const cates = await tv.getCategory()
//   env.set("category", cates[0].id)
//   env.set("page", 1)
//   const home = await tv.getHome()
//   env.set('keyword', '我能')
//   const search = await tv.getSearch()
//   env.set("movieId", search[0].id)
//   const detail = await tv.getDetail()
//   env.set("iframe", detail.playlist![0].videos[0].id)
//   const realM3u8 = await tv.parseIframe()
//   debugger
// })()