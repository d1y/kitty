// import { kitty, req, createTestEnv } from 'utils'

export default class Yjbav implements Handle {
  getConfig() {
    return <Iconfig>{
      id: "yjbav",
      name: "一级棒",
      type: 1,
      nsfw: true,
      api: "https://yjb.one"
    }
  }
  async getCategory() {
    return [
      {
        "id": "21",
        "text": "国产自拍"
      },
      {
        "id": "22",
        "text": "网红主播"
      },
      {
        "id": "24",
        "text": "自拍精选"
      },
      {
        "id": "25",
        "text": "国产传媒"
      },
      {
        "id": "26",
        "text": "日本无码"
      },
      {
        "id": "27",
        "text": "日本有码"
      },
      {
        "id": "28",
        "text": "有码精选"
      },
      {
        "id": "34",
        "text": "亚洲精选"
      },
      {
        "id": "29",
        "text": "小众口味"
      },
      {
        "id": "30",
        "text": "欧美精选"
      },
      {
        "id": "31",
        "text": "成人动漫"
      },
      {
        "id": "32",
        "text": "经典三级"
      },
      {
        "id": "33",
        "text": "Ai明星"
      }
    ]
  }
  async getHome() {
    const cate = env.get("category")
    const page = env.get("page")
    const url = `${env.baseUrl}/vodtype/${cate}-${page}/`
    const $ = kitty.load(await req(url))
    return $(".post-list .col-md-3").toArray().map<IMovie>(item => {
      const a = $(item).find("a")
      const img = a.find("img")
      const id = a.attr("href") ?? ""
      let cover = img.attr("data-original") ?? ""
      cover = `${env.baseUrl}${cover}`
      const title = img.attr("alt") ?? ""
      return { id, cover, title }
    })
  }
  async getDetail() {
    const id = env.get<string>("movieId")
    const url = `${env.baseUrl}${id}`
    const html = await req(url)
    const $ = kitty.load(html)
    const m3u8 = kitty.utils.getM3u8WithStr(html)
    const title = $(".breadcrumb").text().trim()
    return <IMovie>{
      id,
      title,
      playlist: [
        {
          title: "默认", videos: [
            { text: "😍播放", url: m3u8 }
          ]
        }
      ]
    }
  }
}

// TEST
// const env = createTestEnv("https://yjb.one")
// const call = new Yjbav();
// (async ()=> {
//   const cates = await call.getCategory()
//   env.set("category", cates[0].id)
//   env.set("page", 1)
//   const home = await call.getHome()
//   env.set("movieId", home[0].id)
//   const detail = await call.getDetail()
//   debugger
// })()