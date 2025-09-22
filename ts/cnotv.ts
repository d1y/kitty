// import { kitty, req, createTestEnv } from 'utils'

export default class cnotv implements Handle {
  getConfig() {
    return <Iconfig>{
      id: 'cnotv',
      name: '明月影视',
      api: "https://cnotv.com",
      nsfw: false,
      type: 1
    }
  }
  async getCategory() {
    return [
      { text: '电影', id: "1" },
      { text: '电视剧', id: "2" },
      { text: '综艺', id: "3" },
      { text: '动漫', id: "4" },
      { text: '体育记录', id: "5" },
      { text: '短剧', id: "51" },
    ]
  }
  async getHome() {
    const cate = env.get('category')
    const page = env.get('page')
    const url = `${env.baseUrl}/vodshow/${cate}--------${page}---.html`
    const html = await req(url)
    const $ = kitty.load(html)
    return $($(".module .module-list").toArray()[0]).find(".module-items .module-item").toArray().map<IMovie>(item => {
      const a = $(item).find("a")
      const img = $(item).find("img")
      const id = a.attr("href") ?? ""
      const cover = img.attr("data-src") ?? ""
      const title = img.attr("alt") ?? ""
      const remark = $(item).find('.module-item-text').text() ?? ""
      return <IMovie>{ id, title, cover, remark, playlist: [] }
    })
  }
  async getDetail() {
    const id = env.get("movieId")
    const url = `${env.baseUrl}${id}`
    const html = await req(url)
    const $ = kitty.load(html)
    const title = $('.page-title').text() ?? ""
    const cover = $('.video-cover img').attr('data-src') ?? ""
    const desc = $(".video-info-item.video-info-content.vod_content span").text() ?? ""
    const tabs = $('.play-source-tab a, .module-tab-item').toArray().map(item => {
      const name = $(item).attr("data-dropdown-value") ?? "默认"
      return name
    })
    const playlistTable = $(".module-player-list").toArray().map(item => {
      let id = $(item).attr("id") ?? ""
      id = id.replace("glist-", "")
      const list = $(item).find(".sort-item a").toArray().map(item => {
        const text = ($(item).text() ?? "").trim()
        const id = $(item).attr("href") ?? ""
        return <IPlaylistVideo>{ text, id }
      })
      return { id: +id, list }
    })
    const playlist = tabs.map((item, index) => {
      return <IPlaylist>{
        title: item,
        videos: playlistTable[index].list
      }
    })
    return <IMovie>{ id, cover, title, remark: "", desc, playlist }
  }
  async getSearch() {
    const wd = env.get("keyword")
    const page = env.get("page")
    const url = `${env.baseUrl}/vodsearch/${wd}----------${page}---.html`
    const html = await req(url)
    const $ = kitty.load(html)
    return $(".module-search-item").toArray().map<IMovie>(item => {
      const a = $(item).find("a")
      const img = $(item).find("img")
      const id = a.attr("href") ?? ""
      const title = a.attr("title") ?? ""
      const cover = img.attr("data-src") ?? ""
      return { id, title, cover, remark: "", desc: "", playlist: [] }
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
// const env = createTestEnv("https://cnotv.com")
// const tv = new cnotv();
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