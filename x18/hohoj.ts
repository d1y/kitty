// import { kitty, req, createTestEnv } from 'utils'

export default class Hohoj implements Handle {
  getConfig() {
    return <Iconfig>{
      id: "hohoj$",
      name: "HOHOJ",
      api: 'https://hohoj.tv',
      nsfw: true,
      type: 1,
    }
  }
  async getCategory() {
    return [
      {
        "text": "全部",
        "id": "all"
      },
      {
        "text": "欧美",
        "id": "europe"
      },
      {
        "text": "中字",
        "id": "chinese"
      },
      {
        "text": "无码",
        "id": "uncensored"
      },
      {
        "text": "有码",
        "id": "censored"
      }
    ]
  }
  async getHome() {
    const cate = env.get("category")
    const page = env.get("page")
    const url = `${env.baseUrl}/search?type=${cate}&p=${page}`
    const $ = kitty.load(await req(url))
    return $('.video-item.col-lg-3.col-md-3.col-sm-6.col-6.mt-4').toArray().map<IMovie>((element) => {
      const videoid = $(element).find("a").attr("href")!.match(/id=(\d+)/)![1]
      const title = $(element).find('.video-item-title.mt-1').text()
      const cover = $(element).find('img').attr('src') ?? ""
      const remarks = $(element).find('.video-item-badge').text()
      return { id: videoid, cover, title, remark: remarks }
    })
  }
  async getDetail() {
    const id = env.get<string>("movieId")
    const url = `${env.baseUrl}/video?id=${id}`
    const $ = kitty.load(await req(url))
    const title = $("h5.mt-3").text()
    const cover = $(`meta[property="og:image"]`).attr("content") ?? ""
    const html2 = await req(`${env.baseUrl}/embed?id=${id}`)
    const $2 = kitty.load(html2)
    const m3u8 = $2('video#my-video').attr("src") ?? ""
    const playlist = <IPlaylist[]>[
      {
        title: "默认", videos: [
          { text: "😍播放", url: m3u8 }
        ]
      }
    ]
    return {
      id,
      title,
      cover,
      playlist,
    }
  }
  async getSearch() {
    const wd = env.get("keyword")
    const page = env.get("page")
    const url = `${env.baseUrl}/search?text=${wd}&p=${page}`
    const $ = kitty.load(await req(url))
    return $('.video-item.col-lg-3.col-md-3.col-sm-6.col-6.mt-4').toArray().map<IMovie>((element) => {
      const videoid = $(element).find("a").attr("href")!.match(/id=(\d+)/)![1]
      const title = $(element).find('.video-item-title.mt-1').text()
      const cover = $(element).find('img').attr('src') ?? ""
      const remarks = $(element).find('.video-item-badge').text()
      return { id: videoid, cover, title, remark: remarks }
    })
  }
}

// TEST
// const env = createTestEnv("https://hohoj.tv")
// const call = new Hohoj();
// ;(async () => {
//   const cates = await call.getCategory()
//   env.set("category", cates[0].id)
//   env.set("page", 1)
//   const home = await call.getHome()
//   env.set("keyword", "黑丝")
//   const search = await call.getSearch()
//   env.set("movieId", search[0].id)
//   const detail = await call.getDetail()
//   debugger
// })()