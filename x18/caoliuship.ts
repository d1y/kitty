// import { kitty, req, createTestEnv } from 'utils'

export default class 草榴视频 implements Handle {
  getConfig() {
    return <Iconfig>{
      id: "caoliuship",
      name: "草榴视频",
      type: 1,
      nsfw: true,
      api: "https://xn--r8vr95cose26q.top"
    }
  }
  async getCategory() {
    return [
    {
        "id": "2",
        "text": "国产福利"
    },
    {
        "id": "8",
        "text": "国产精选"
    },
    {
        "id": "3",
        "text": "国产主播"
    },
    {
        "id": "4",
        "text": "日本无码"
    },
    {
        "id": "5",
        "text": "日本有码"
    },
    {
        "id": "7",
        "text": "欧美精选"
    },
    {
        "id": "9",
        "text": "Ai明星换脸"
    },
    {
        "id": "10",
        "text": "成人动漫"
    },
    {
        "id": "11",
        "text": "各种口味"
    },
    {
        "id": "12",
        "text": "三级伦理"
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
// const env = createTestEnv("https://xn--r8vr95cose26q.top")
// const call = new 草榴视频();
// (async ()=> {
//   const cates = await call.getCategory()
//   env.set("category", cates[0].id)
//   env.set("page", 1)
//   const home = await call.getHome()
//   env.set("movieId", home[0].id)
//   const detail = await call.getDetail()
//   debugger
// })()