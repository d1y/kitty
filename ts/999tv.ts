// import { kitty, req, createTestEnv } from 'utils'

export default class JS999tv implements Handle {
  getConfig() {
    return <Iconfig>{
      id: '999tv',
      name: '999tv',
      api: "https://999tv.app",
      type: 1,
      nsfw: false,
    }
  }
  async getCategory() {
    return <ICategory[]>[
      { text: "电影", id: "20" },
      { text: "连续剧", id: "21" },
      { text: "综艺片", id: "22" },
      { text: "伦理片", id: "23" },
      { text: "动漫片", id: "24" },
      { text: "短剧大片", id: "25" },
      { text: "体育赛事", id: "26" },
    ]
  }
  async getHome() {
    const cate = env.get("category")
    const page = env.get("page")
    const url = `${env.baseUrl}/index.php/vod/show/id/${cate}/page/${page}.html`
    const html = await req(url)
    const $ = kitty.load(html)
    return $(".module a.module-poster-item.module-item").toArray().map(item=> {
      const id = $(item).attr("href") ?? ""
      const title = $(item).attr("title") ?? ""
      const remark = $(item).find(".module-item-note").text() ?? ""
      const cover = $(item).find(".lazy.lazyload").attr("data-original") ?? ""
      return { id, title, cover, remark, playlist: [] }
    })
  }
  async getDetail() {
    const id = env.get("movieId")
    const url = `${env.baseUrl}${id}`
    const html = await req(url)
    const $ = kitty.load(html)
    const desc = $(".show-desc").text()
    const title = $(".module-info-heading h1").text()
    const cover = $(".ls-is-cached.lazy.lazyload").attr("data-original") ?? ""
    // FIXME(d1y): 多源
    const playlist: IPlaylist[] = $(".module-play-list-link").toArray().map(item=> {
      const text = $(item).text()
      const id = $(item).attr("href") ?? ""
      return { text, id }
    })
    return <IMovie>{
      id,
      title,
      cover,
      desc,
      remark: "",
      playlist,
    }
  }
  async getSearch() {
    // FIXME(d1y): 它这里有反爬虫策略, 返回的html在调戏我
    const wd = env.get("keyword")
    const page = env.get("page")
    const url = `${env.baseUrl}/index.php/vod/search/page/${page}/wd/${wd}.html`
    const html = await req(url)
    const $ = kitty.load(html)
    return $(".module-items.module-card-items .module-card-item").toArray().map(item=> {
      const a = $(item).find("a.module-card-item-poster")
      const img = $(item).find("img")
      const id = a.attr("href") ?? ""
      const title = img.attr("alt") ?? ""
      const cover = img.attr("data-original") ?? ""
      const remark = $(item).find(".module-card-item-class").text()
      return { id, title, cover, remark, playlist: [] }
    })
  }
  async parseIframe() {
    const iframe = env.get<string>("iframe")
    const html = await req(`${env.baseUrl}${iframe}`)
    const m3u8 = html.match(/"url"\s*:\s*"([^"]+\.m3u8)"/)![1]
    const m3u8Str = m3u8.replaceAll("\\/", "/")
    return m3u8Str
  }
}

// TEST
// const env = createTestEnv("https://999tv.app")
// const ny = new JS999tv()
// ;(async ()=> {
//   const category = await ny.getCategory()
//   env.set("category", category[0].id)
//   env.set("page", 2)
//   const home = await ny.getHome()
//   env.set("keyword", "黑社会")
//   const search = await ny.getSearch()
//   // env.set("movieId", search[1].id)
//   env.set("movieId", home[1].id)
//   const detail = await ny.getDetail()
//   env.set("iframe", detail[0].playlist[0].id)
//   const realM3u8 = await ny.parseIframe()
//   debugger
// })()