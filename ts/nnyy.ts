// import { kitty, req, createTestEnv, write } from 'utils'

// 源地址: https://nnyy.in
// ^ 该地址默认不支持 page 参数, 所以使用子域名
// 该源可能需要过CF墙, 需要壳留存 CF-id
export default class nnyy implements Handle {
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
    return [
      {
        "id": "1",
        "text": "电影"
      },
      {
        "id": "2",
        "text": "电视剧"
      },
      {
        "id": "3",
        "text": "综艺"
      },
      {
        "id": "4",
        "text": "动漫"
      },
      {
        "id": "40",
        "text": "短剧"
      },
      {
        "id": "20",
        "text": "动画片"
      },
      {
        "id": "6",
        "text": "动作片"
      },
      {
        "id": "7",
        "text": "喜剧片"
      },
      {
        "id": "8",
        "text": "爱情片"
      },
      {
        "id": "9",
        "text": "科幻片"
      },
      {
        "id": "10",
        "text": "恐怖片"
      },
      {
        "id": "11",
        "text": "剧情片"
      },
      {
        "id": "12",
        "text": "战争片"
      },
      {
        "id": "21",
        "text": "奇幻片"
      },
      {
        "id": "22",
        "text": "犯罪片"
      },
      {
        "id": "23",
        "text": "悬疑片"
      },
      {
        "id": "24",
        "text": "纪录片"
      },
      {
        "id": "25",
        "text": "邵氏电影"
      },
      {
        "id": "13",
        "text": "国产剧"
      },
      {
        "id": "14",
        "text": "香港剧"
      },
      {
        "id": "15",
        "text": "台湾剧"
      },
      {
        "id": "16",
        "text": "日本剧"
      },
      {
        "id": "26",
        "text": "韩国剧"
      }
    ]
  }
  async getHome() {
    const cate = env.get("category")
    const page = env.get("page")
    const url = `${env.baseUrl}/vodtype/${cate}-${page}.html`
    const html = await req(url)
    const $ = kitty.load(html)
    return $(".myui-vodlist li").toArray().map<IMovie | null>(item => {
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
    const desc = $(".data p").text() ?? ""
    const player: IPlaylistVideo[] = $(".myui-content__list.sort-list li").toArray().map(item => {
      const a = $(item).find("a")
      const text = a.text() ?? ""
      const id = a.attr("href") ?? ""
      return { id, text }
    })
    return <IMovie>{ id, cover, title, desc, remark, playlist: [{ title: "百度资源", videos: player }] }
  }
  // async getSearch() {
  //   const wd = env.get("keyword")
  //   const page = env.get("page")
  //   const url = `${env.baseUrl}/vodsearch/${wd}----------${page}---.html`
  //   // 这里可能有CF墙(只需要附带CF-id即可)
  //   const html = await req(url)
  //   const $ = kitty.load(html)
  //   return $(".myui-vodlist__media li").toArray().map<IMovie>(item => {
  //     const a = $(item).find("a.myui-vodlist__thumb")
  //     const title = a.attr("title") ?? ""
  //     const id = a.attr("href") ?? ""
  //     const remark = a.find(".pic-text.text-right").text() ?? ""
  //     const cover = a.attr("data-original") ?? ""
  //     return { title, id, remark, cover, playlist: [] }
  //   })
  // }
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