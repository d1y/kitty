import { kitty, req, createTestEnv } from 'utils'

export default class duonaovod implements Handle {
  getConfig() {
    return <Iconfig>{
      id: 'duonaovod',
      name: '多瑙影院',
      api: "https://www.duonaovod.com",
      nsfw: false,
      type: 1,
      extra: {
        gfw: false,
        searchLimit: 12,
      }
    }
  }

  async getCategory() {
    return <ICategory[]>[
      {
        "text": "首页",
        "id": "/"
      },
      {
        "text": "电影",
        "id": "1"
      },
      {
        "text": "电视剧",
        "id": "2"
      },
      {
        "text": "综艺",
        "id": "3"
      },
      {
        "text": "动漫",
        "id": "4"
      },
      {
        "text": "短剧",
        "id": "57"
      },
      {
        "text": "动作片",
        "id": "6"
      },
      {
        "text": "喜剧片",
        "id": "7"
      },
      {
        "text": "爱情片",
        "id": "8"
      },
      {
        "text": "科幻片",
        "id": "9"
      },
      {
        "text": "恐怖片",
        "id": "10"
      },
      {
        "text": "剧情片",
        "id": "11"
      },
      {
        "text": "奇幻片",
        "id": "30"
      },
      {
        "text": "战争片",
        "id": "12"
      },
      {
        "text": "犯罪片",
        "id": "54"
      },
      {
        "text": "动漫电影",
        "id": "55"
      },
      {
        "text": "伦理片",
        "id": "34"
      },
      {
        "text": "国产剧",
        "id": "13"
      },
      {
        "text": "港台剧",
        "id": "14"
      },
      {
        "text": "日韩剧",
        "id": "15"
      }
    ]
  }

  async getHome() {
    const cate = env.get('category')
    const page = env.get('page')
    if (cate == "/") {
      const $ = kitty.load(await req(env.baseUrl))
      const cards = $(".conch-ctwrap .container").toArray().map<IHomeContentItem | null>(item => {
        const _title = $(item).find(".hl-rb-title").toArray()
        if (!_title.length) return null
        const title = $(_title[0]).text().trim()
        const isCard = $(item).find(".hl-vod-list").hasClass("swiper-wrapper")
        const list = $(item).find(".hl-row-box .hl-list-wrap .hl-list-item").toArray()
        const table = list.map(subItem => {
          const a = $(subItem).find("a")
          const id = a?.attr("href") ?? ""
          const cover = a?.attr("data-original") ?? ""
          const title = a?.attr("title") ?? ""
          const remark = a?.find(".remarks")?.text().trim()
          return { id, cover, title, remark }
        })
        if (!table.length) return null
        return <IHomeContentItem>{
          type: isCard ? "card" : "list",
          title,
          videos: table,
        }
      }).filter(item => !!item)
      return <IHomeData>{
        type: 'complex',
        data: [
          {
            type: "markdown", extra: {
              markdown: `
> 欢迎使用小猫影视(${kitty.VERSION})
> 该源仅做测试使用，不可用于其他用途
> 飞机交流群: https://t.me/catmovie1145
> 小猫其他指南: https://xmpro.netlify.app
`
            }
          },
          ...cards
        ],
      }
    }
    const url = `${env.baseUrl}/index.php/vod/type/id/${cate}/page/${page}.html`
    const $ = kitty.load(await req(url))
    return $(".hl-vod-list li").toArray().map(item => {
      const a = $(item).find("a")
      const id = a.attr("href") ?? ""
      const cover = a.attr("data-original") ?? ""
      const title = a.attr("title") ?? ""
      const remark = $(item).find(".hl-lc-1.remarks").text() ?? ""
      return <IMovie>{ id, title, cover, remark }
    })
  }
  async getDetail() {
    const id = env.get("movieId")
    const url = `${env.baseUrl}${id}`
    const $ = kitty.load(await req(url))
    let desc = $(".hl-col-xs-12.blurb").text().trim().replace("简介：", "")
    if (desc == "暂无简介") desc = ""
    const tabs = $(".hl-plays-from a").toArray().map(item => {
      return $(item).text().trim()
    })
    const _videos = $(".hl-tabs-box").toArray().map<IPlaylistVideo[]>((item) => {
      return $(item).find("li a").toArray().map(item => {
        const id = $(item).attr("href") ?? ""
        const text = $(item).text() ?? ""
        return { id, text }
      })
    })
    const playlist = tabs.map((title, index) => {
      const videos = _videos[index]
      return <IPlaylist>{ title, videos }
    })
    return <IMovie>{ desc, playlist }
  }
  async getSearch() {
    const wd = env.get("keyword")
    const page = env.get("page")
    const url = `${env.baseUrl}/index.php/vod/search/page/${page}/wd/${wd}.html`
    const $ = kitty.load(await req(url))
    return $(".hl-one-list li").toArray().map<IMovie>(item => {
      const a = $(item).find("a")
      const id = a.attr("href") ?? ""
      const cover = a.attr("data-original") ?? ""
      const title = a.attr("title") ?? ""
      return { id, cover, title, remark: "" }
    })
  }
  async parseIframe() {
    const iframe = env.get<string>("iframe")
    const html = await req(`${env.baseUrl}${iframe}`)
    const $ = kitty.load(html)
    const script = $("script").toArray().filter(item => {
      const text = $(item).text().trim()
      if (text.startsWith("var player_aaaa")) return true
    })[0]
    let code = $(script).text().trim().replace("var player_aaaa=", "")
    code = `(${code})`

    const unsafeObj: { url: string, encrypt: '1' | '2' } = eval(code)

    // https://www.duonaovod.com/static/js/player.js?t=a20250923
    if (unsafeObj.encrypt == '1') {
      unsafeObj.url = unescape(unsafeObj.url);
    } else if (unsafeObj.encrypt == '2') {
      unsafeObj.url = unescape(atob(unsafeObj.url));
    }
    return unsafeObj.url
  }
}

const env = createTestEnv("https://www.duonaovod.com")
const tv = new duonaovod();
(async () => {
  const cates = await tv.getCategory()
  env.set("category", cates[1].id)
  env.set("page", 1)
  const home = await tv.getHome()
  env.set('keyword', '我能')
  const search = await tv.getSearch()
  env.set("movieId", search[0].id)
  const detail = await tv.getDetail()
  env.set("iframe", detail.playlist![0].videos[0].id)
  const realM3u8 = await tv.parseIframe()
  debugger
})()