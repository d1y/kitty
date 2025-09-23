// import { kitty, req, createTestEnv } from 'utils'

export default class jsdy implements Handle {
  getConfig() {
    return <Iconfig>{
      id: 'jsdy$',
      name: "极速电影",
      api: "https://32d.cc",
      nsfw: false,
      type: 1,
    }
  }
  async getCategory() {
    return [
      { text: '电影', id: "1" },
      { text: '电视剧', id: "2" },
      { text: '综艺', id: "3" },
      { text: '动漫', id: "4" },
      { text: '短剧', id: "5" },
    ]
  }
  async getHome() {
    const cate = env.get('category')
    const page = env.get('page')
    const url = `${env.baseUrl}/index.php/vod/type/id/${cate}/page/${page}.html`
    const html = await req(url)
    const $ = kitty.load(html)
    return $(".stui-vodlist__item").toArray().map<IMovie>(item => {
      const a = $(item).find("a.stui-vodlist__thumb")
      const id = a.attr("href") ?? ""
      const title = a.attr("title") ?? ""
      let cover = a.find("img").attr("data-original") ?? ""
      cover = `${env.baseUrl}${cover}`
      return <IMovie>{ id, title, cover }
    })
  }
  async getDetail() {
    const id = env.get<string>("movieId")
    const url = `${env.baseUrl}${id}`
    const html = await req(url)
    const $ = kitty.load(html)
    const a = $(".stui-content.col-pd a.stui-vodlist__thumb")
    const title = a.attr("title") ?? ""
    let cover = a.find("img").attr("data-original") ?? ""
    cover = `${env.baseUrl}${cover}`
    const desc = ($(".stui-content__desc").text() ?? "").trim()
    const player = $(".stui-content__playlist li").toArray().map(item => {
      const a = $(item).find("a")
      const id = a.attr("href") ?? ""
      const text = a.attr("title") ?? ""
      return <IPlaylistVideo>{ id, text }
    })
    const playlist = <IPlaylist>{ title: "极速播放", videos: player }
    return <IMovie>{ id, title, cover, desc, remark: "", playlist: [playlist] }
  }
  async getSearch() {
    const page = env.get<string>("page")
    const wd = env.get<string>("keyword")
    const url = `${env.baseUrl}/index.php/vod/search/page/${page}/wd/${wd}.html`
    const html = await req(url)
    const $ = kitty.load(html)
    return $(".stui-vodlist__item").toArray().map<IMovie>(item => {
      const a = $(item).find("a.stui-vodlist__thumb")
      const id = a.attr("href") ?? ""
      const title = a.attr("title") ?? ""
      let cover = a.find("img").attr("data-original") ?? ""
      cover = `${env.baseUrl}${cover}`
      return <IMovie>{ id, title, cover }
    })
  }
  async parseIframe() {
    return kitty.utils.getM3u8WithIframe(env)
  }
}

// TEST
// const env = createTestEnv("https://32d.cc")
// const tv = new jsdy();
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