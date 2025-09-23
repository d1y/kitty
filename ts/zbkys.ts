// import { kitty, req, createTestEnv } from 'utils'

export default class zbkys implements Handle {
  getConfig() {
    return <Iconfig>{
      id: "qnys-zbkys",
      name: "真不卡影院",
      api: "https://m.dgytlt.com",
      nsfw: false,
      type: 1
    }
  }
  async getCategory() {
    return <ICategory[]>[
      { text: "电影", id: "1" },
      { text: "电视剧", id: "2" },
      { text: "综艺", id: "3" },
      { text: "综艺", id: "3" },
      { text: "动漫", id: "4" },
    ]
  }
  async getHome() {
    const cate = env.get("category")
    const page = env.get("page")
    const url = `${env.baseUrl}/vodshow/${cate}--------${page}---.html`
    const html = await req(url)
    const $ = kitty.load(html)
    return $(".stui-vodlist li").toArray().map<IMovie>(item => {
      const a = $(item).find("a.stui-vodlist__thumb")
      const id = a.attr("href") ?? ""
      const title = a.attr("title") ?? ""
      const cover = a.attr("data-original") ?? ""
      const remark = a.find(".pic-text.text-right").text() ?? ""
      return <IMovie>{ id, title, cover, remark }
    })
  }
  async getDetail() {
    const id = env.get("movieId")
    const url = `${env.baseUrl}${id}`
    const html = await req(url)
    const $ = kitty.load(html)
    const tabs = $(".nav.nav-tabs li").toArray().map(item => {
      return $(item).text() ?? ""
    })
    const map = $(".stui-panel_bd div.tab-pane").toArray().map(item => {
      return $(item).find("a").toArray().map(_ => {
        const text = $(_).text() ?? ""
        const id = $(_).attr("href") ?? ""
        return <IPlaylistVideo>{ id, text }
      })
    })
    const playlist = tabs.map((title, index) => {
      const videos = map[index]
      return <IPlaylist>{ title, videos }
    })
    const a = $(".stui-pannel-box .stui-vodlist__thumb.picture.v-thumb")
    const title = a.attr("title") ?? ""
    const cover = a.find("img").attr("data-original") ?? ""
    const desc = $(".detail.col-pd").text() ?? ""
    return <IMovie>{ id, title, cover, desc, playlist }
  }

  async getSearch() {
    const page = env.get<string>("page")
    const wd = env.get<string>("keyword")
    const url = `${env.baseUrl}/vodsearch/${wd}----------${page}---.html`
    const html = await req(url)
    const $ = kitty.load(html)
    return $(".stui-vodlist__media li").toArray().map(item=> {
      const a = $(item).find(".v-thumb.stui-vodlist__thumb")
      const title = a.attr("title") ?? ""
      const cover = a.attr("data-original") ?? ""
      const id = a.attr("href") ?? ""
      const remark = a.find(".pic-text.text-right").text() ?? ""
      return { id, title, cover, remark }
    })
  }

  async parseIframe() {
    return kitty.utils.getM3u8WithIframe(env)
  }
}

// TEST
// const env = createTestEnv("https://m.dgytlt.com")
// const tv = new qnys();
// (async () => {
//   const cates = await tv.getCategory()
//   env.set("category", cates[0].id)
//   env.set("page", 1)
//   const home = await tv.getHome()
//   env.set("keyword", "我能")
//   const search = await tv.getSearch()
//   env.set("movieId", search[0].id)
//   const detail = await tv.getDetail()
//   env.set("iframe", detail.playlist![0].videos[0].id)
//   const realM3u8 = await tv.parseIframe()
//   debugger
// })()