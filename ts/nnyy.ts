// import { kitty, req, createTestEnv, write } from '../utils'

// 源地址: https://nnyy.in
// ^ 该地址默认不支持 page 参数, 所以使用子域名
// 该源可能需要过CF墙, 需要壳留存 CF-id
export class nnyy implements Handle {
  getConfig() {
    return <Iconfig>{
      id: "nnyy",
      name: "努努影院",
      desc: "子域名",
      api: "https://www.huibangpaint.com",
      nsfw: false,
      type: 1,
    }
  }

  async getCategory() {
    const html = await req(env.baseUrl)
    const $ = kitty.load(html)
    return $(".item.nav-list li").toArray().map<ICategory | null>(item=> {
      const a = $(item).find("a")
      const text = a.text().trim()
      if (text == "首页") return null
      const id = (a.attr("href") ?? "").replace("/vodtype/", "").replace(".html", "")
      return { id, text }
    }).filter(item=> !!item)
  }
  async getHome() {
    const cate = env.get("category")
    const page = env.get("page")
    const url = `${env.baseUrl}/vodtype/${cate}-${page}.html`
    const html = await req(url)
    const $ = kitty.load(html)
    return $(".myui-vodlist li").toArray().map<IMovie | null>(item=> {
      const a = $(item).find("a.myui-vodlist__thumb")
      const title = a.attr("title") ?? ""
      const id = a.attr("href") ?? ""
      const cover = a.attr("data-original") ?? ""
      const remark = a.find(".pic-text.text-right").text() ?? ""
      return { title, id, cover, remark, playlist: [] }
    }).filter(item => !!item)
  }
  async getDetail() {
    const id = env.get("movieId")
    const url = `${env.baseUrl}${id}`
    const html = await req(url)
    const $ = kitty.load(html)
    const a = $(".myui-content__thumb .myui-vodlist__thumb.picture")
    const cover = a.find("img").attr("data-original") ?? ""
    const title = a.attr("title") ?? ""
    const remark = $(".data .text-red").text() ?? ""
    // FIXME(d1y): 如果是多源的话就惨了
    // > 壳的通用解析需要适配 Map<string, IPlaylist[]>
    const playlist: IPlaylist[] = $(".myui-content__list.sort-list li").toArray().map(item=> {
      const a = $(item).find("a")
      const text = a.text() ?? ""
      const id = a.attr("href") ?? ""
      return { id, text}
    })
    return <IMovie[]>[{ id, cover, title, remark, playlist: playlist }]
  }
  async getSearch() {
    const wd = env.get("keyword")
    const page = env.get("page")
    const url = `${env.baseUrl}/vodsearch/${wd}----------${page}---.html`
    // 这里可能有CF墙(只需要附带CF-id即可)
    const html = await req(url)
    const $ = kitty.load(html)
    return $(".myui-vodlist__media li").toArray().map<IMovie>(item=> {
      const a = $(item).find("a.myui-vodlist__thumb")
      const title = a.attr("title") ?? ""
      const id = a.attr("href") ?? ""
      const remark = a.find(".pic-text.text-right").text() ?? ""
      const cover = a.attr("data-original") ?? ""
      return { title, id, remark, cover, playlist: [] }
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
// const env = createTestEnv("https://www.huibangpaint.com")
// const ny = new nnyy()
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