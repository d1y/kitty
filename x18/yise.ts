// import { kitty, req, createTestEnv } from 'utils'

export default class Yise6324 implements Handle {
  getConfig() {
    return <Iconfig>{
      id: 'yise6324',
      name: "一色",
      api: "https://yise42.xyz",
      nsfw: true,
      type: 1,
    }
  }
  async getCategory() {
    return <ICategory[]>[
      {
        text: "AI换脸",
        id: "AI换脸",
      },
      {
        text: "无码",
        id: "无码",
      },
      {
        text: "黑丝",
        id: "黑丝",
      },
      {
        text: "FC2",
        id: "fc2",
      }
    ]
  }
  async getHome() {
    const cate = env.get<string>("category")
    const page = env.get("page")
    const url = `${env.baseUrl}/sp/index.php/vod/search/page/${page}/wd/${cate}.html`
    const $ = kitty.load(await req(url))
    return $(".stui-vodlist li").toArray().map(item=> {
      const a = $(item).find("a")
      const title = a.attr("title") ?? ""
      const cover = a.attr("data-original") ?? ""
      const id = a.attr("href") ?? ""
      const remark = a.find(".pic-text.text-right").text().trim()
      return { title, cover, id, remark }
    })
  }
  async getDetail() {
    const id = env.get<string>("movieId")
    const url = `${env.baseUrl}${id}`
    const html = await req(url)
    const $ = kitty.load(html)
    const m3u8 = kitty.utils.getM3u8WithStr(html)
    const title = $("h1.title").text()
    return <IMovie>{ title, playlist: [{ title: "默认", videos: [{ text: "播放", id: m3u8 }] }] }
  }
  async getSearch() {
    const wd = env.get<string>("keyword")
    const page = env.get("page")
    const url = `${env.baseUrl}/sp/index.php/vod/search/page/${page}/wd/${wd}.html`
    const $ = kitty.load(await req(url))
    return $(".stui-vodlist li").toArray().map(item=> {
      const a = $(item).find("a")
      const title = a.attr("title") ?? ""
      const cover = a.attr("data-original") ?? ""
      const id = a.attr("href") ?? ""
      const remark = a.find(".pic-text.text-right").text().trim()
      return { title, cover, id, remark }
    })
  }
}

// TEST
// const env = createTestEnv('https://yise42.xyz')
// const call = new Yise6324();
// (async ()=> {
//   const cates = await call.getCategory()
//   env.set("category", cates[0].id)
//   env.set("page", 1)
//   const home = await call.getHome()
//   env.set("movieId", home[0].id)
//   const detail = await call.getDetail()
//   env.set("keyword", "黑丝")
//   const search = await call.getSearch()
//   debugger
// })()