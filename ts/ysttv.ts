// import { kitty, req, createTestEnv } from 'utils'

export default class ysttv implements Handle {
  getConfig() {
    return <Iconfig>{
      id: "ysttv$",
      name: "影视天堂",
      type: 1,
      nsfw: false,
      api: "https://ysttv.com",
    }
  }
  async getCategory() {
    return <ICategory[]>[
      {
        "text": "电影",
        "id": "1"
      },
      {
        "text": "电视",
        "id": "2"
      },
      {
        "text": "综艺",
        "id": "3"
      },
      {
        "text": "动漫",
        "id": "4"
      },
      {
        "text": "短剧",
        "id": "5"
      }
    ]
  }
  async getHome() {
    const cate = env.get('category')
    const page = env.get('page')
    const url = `${env.baseUrl}/library/index/c/${cate}/y/all/s/${page}`
    const html = await req(url)
    const $ = kitty.load(html)
    return $("main ul.mb-5 > li").toArray().map(item => {
      const img = $(item).find("img")
      const id = $(item).find("a").attr("href") ?? ""
      const cover = img.attr("data-src") ?? ""
      const title = img.attr("alt") ?? ""
      const remark = parseFloat($(item).find(".tag.bg-dx-blue").text()).toFixed(1) || $(item).find(".text-white").text()
      return <IMovie>{ id, title, cover, remark }
    })
  }
  async getDetail() {
    const id = env.get("movieId")
    const url = `${env.baseUrl}${id}`
    const html = await req(url)
    const $ = kitty.load(html)
    const title = $(".text-5xl.font-bold").text().trim()
    const cover = $(".border-2.border-white.border-solid img").attr("data-src")?.trim()
    const _videos = $(".overflow-auto > ul > li").toArray().map<IPlaylistVideo>((item) => {
      const a = $(item).find("a")
      const id = $(a).attr("href") ?? ""
      const text = ($(a).text() ?? "").trim()
      return { id, text }
    })
    const playlist = <IPlaylist[]>[ { title: "默认", videos: _videos } ]
    return <IMovie>{ id, title, cover, playlist }
  }
  async getSearch() {
    const wd = env.get("keyword")
    const page = env.get("page")
    // FIXME(d1y): 应该添加父id(现在默认是1)
    const url = `${env.baseUrl}/search/index/type/1/keyword/${wd}/page/${page}`
    const html = await req(url)
    const $ = kitty.load(html)
    return $("main ul.grid > li").toArray().map<IMovie>(item => {
      const img = $(item).find("img")
      const id = $(item).find("a").attr("href") ?? ""
      const cover = img.attr("data-src") ?? ""
      const title = img.attr("alt") ?? ""
      // const remark = parseFloat($(item).find(".tag.bg-dx-blue").text()).toFixed(1) || $(item).find(".text-white").text()
      const remark = ""
      return <IMovie>{ id, title, cover, remark }
    })
  }

  async parseIframe() {
    const iframe = env.get<string>("iframe")
    const html = await req(`${env.baseUrl}${iframe}`)
    const $ = kitty.load(html)
    return $("#mse").attr("data-url") ?? ""
  }
}

// TEST
// const env = createTestEnv("https://ysttv.com")
// const tv = new ysttv();
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