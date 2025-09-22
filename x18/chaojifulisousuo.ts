// import { kitty, createTestEnv, req } from 'utils'

export default class chaojisousuo14 implements Handle {
  getConfig() {
    return <Iconfig>{
      id: 'chaojifulisousuo',
      name: '超级福利搜索',
      type: 1,
      api: 'https://chaojisousuo14.buzz',
      nsfw: true,
    }
  }
  async getCategory() {
    return <ICategory[]>[
      {
        text: "亚洲性爱",
        id: "33",
      },
      {
        text: "热门事件",
        id: "37",
      },
      {
        text: "动漫肉番",
        id: "34",
      },
    ]
  }
  async getHome() {
    const url = `${env.baseUrl}/index.php/vod/type/id/${env.get('category')}/page/${env.get('page')}.html`
    const html = await req(url)
    const $ = kitty.load(html)
    return $(".vodlist .listpic").toArray().map<IMovie>(el => {
      const a = $(el).find("a")
      const pic = $(el).find(".vodpic")
      const name = $(el).find(".vodname")
      const remark = $(el).find(".time")
      return {
        id: a.attr("href") ?? "",
        cover: pic.attr("data-original") ?? "",
        title: name.text() ?? "",
        remark: remark.text(),
        playlist: [],
      }
    })
  }
  async getDetail() {
    const id = env.get("movieId")
    const html = await req(`${env.baseUrl}${id}`)
    const $ = kitty.load(html)
    const img = $(".pull-left.pull-left-mobile1 img.lazy")
    const player: IPlaylistVideo[] = $("#playlist4 tr").toArray().map((item) => {
      const a = $(item).find("a")
      const id = a.attr("href") ?? ""
      const text = a.text()
      return { text, id }
    })
    return <IMovie>{
      title: img.attr("title") ?? "",
      cover: img.attr("src") ?? "",
      id: id,
      playlist: [{ title: "默认", videos: player }],
    }
  }
  async getSearch() {
    const url = `${env.baseUrl}/index.php/vod/search/page/${env.get("page")}/wd/${env.get("keyword")}.html`
    const html = await (await fetch(url)).text()
    const $ = kitty.load(html)
    return $(".show-list li").toArray().map<IMovie>(item => {
      const _ = $(item).find("img") ?? ""
      const a = $(item).find("a.play-img")
      const remark = $($(item).find("dl.fn-left").toArray().at(-1)).find("dd").text()
      const id = a.attr("href") ?? ""
      const cover = _.attr("src") ?? ""
      const title = _.attr("alt") ?? ""
      return { id, cover, title, remark, playlist: [] }
    })
  }
  async parseIframe() {
    const url = `${env.baseUrl}${env.get('iframe')}`
    const html = await req(url)
    const $ = kitty.load(html)
    const script = $("#bofang_box script").text()
    const m3u8 = script.match(/"url":"(.*?)"/)![1].replace(/\\/g, '')
    return m3u8
  }
}

// TEST
// const env = createTestEnv('https://chaojisousuo14.buzz', {
//   page: 1,
//   category: 33,
//   keyword: '黑丝',
// })
// const call = new chaojisousuo14()
// ;(async ()=> {
//   const home = await call.getHome()
//   env.set('movieId', home[0].id)
//   const searchs = await call.getSearch()
//   const detail =  await call.getDetail()
//   debugger
// })()