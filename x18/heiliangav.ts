// import { kitty, req, createTestEnv } from 'utils'

export default class 黑料网 implements Handle {
  getConfig() {
    return <Iconfig>{
      id: 'heiliangav',
      name: '黑料网',
      type: 1,
      // 发布页: https://hlbg13.com
      api: 'https://3rh5s.cfvyjuz.com',
      nsfw: true,
    }
  }
  async getCategory() {
    return [
      {
        "text": "最新黑料",
        "id": "/hlcg/"
      },
      {
        "text": "今日热瓜",
        "id": "/jrrs/"
      },
      {
        "text": "热门黑料",
        "id": "/jqrm/"
      },
      {
        "text": "经典黑料",
        "id": "/lsdg/"
      },
      {
        "text": "日榜黑料",
        "id": "/mrrb/"
      },
      {
        "text": "周榜精选",
        "id": "/zbjx/"
      },
      {
        "text": "月榜热瓜",
        "id": "/ybrg/"
      },
      {
        "text": "原创社区",
        "id": "/ycsq/"
      },
      {
        "text": "全球奇闻",
        "id": "/qqqw/"
      },
      {
        "text": "反差专区",
        "id": "/fczq/"
      },
      {
        "text": "黑料选妃",
        "id": "/hlxf/"
      },
      {
        "text": "校园黑料",
        "id": "/xycg/"
      },
      {
        "text": "网红黑料",
        "id": "/whhl/"
      },
      {
        "text": "影视短剧",
        "id": "/ysdj/"
      },
      {
        "text": "每日大赛",
        "id": "/mrds/"
      },
      {
        "text": "明星丑闻",
        "id": "/mxcw/"
      },
      {
        "text": "深夜综艺",
        "id": "/syzy/"
      },
      {
        "text": "推特社区",
        "id": "/ttsq/"
      },
      {
        "text": "独家爆料",
        "id": "/djbl/"
      },
      {
        "text": "桃图杂志",
        "id": "/ttzz/"
      },
      {
        "text": "黑料课堂",
        "id": "/hlkt/"
      },
      {
        "text": "有求必应",
        "id": "/yqby/"
      },
      {
        "text": "黑料小说",
        "id": "/jqxs/"
      },
      {
        "text": "社会新闻",
        "id": "/shxw/"
      },
      {
        "text": "内涵黑料",
        "id": "/nhhl/"
      },
      {
        "text": "黑料爆改",
        "id": "/hlbg/"
      },
      {
        "text": "官场爆料",
        "id": "/gchl/"
      }
    ]
  }
  async getHome() {
    const cate = env.get("category")
    const page = env.get("page")
    const url = `${env.baseUrl}${cate}page/${page}/`
    const $ = kitty.load(await req(url))
    return $(".video-list .video-item").toArray().map<IMovie | null>(item=> {
      const id = $(item).find("a").attr("href") ?? ""
      if (!id.startsWith("/archives/")) return null
      let cover = $(item).find("img").attr("src") ?? ""
      cover = `${env.baseUrl}${cover}`
      const title = $(item).find("h3").text().trim()
      if (!title) return null
      return { id, cover, title }
    }).filter(item=> !!item)
  }
  async getDetail() {
    let id = env.get<string>("movieId")
    if (!id.startsWith("/archives")) {
      id = `/archives/${id}`
    }
    const url = `${env.baseUrl}${id}`
    const $ = kitty.load(await req(url))
    const title = $(".detail-title").text().trim()
    let desc = ""
    $(".client-only-placeholder p").toArray().forEach(item=> {
      const _ = $(item).text()
      desc += _
    })
    const videos = $(".dplayer").toArray().map<IPlaylistVideo>((item, index)=> {
      const cfgCode = $(item).attr("config") ?? ""
      const unsafeObj: {
        video: { url: string }
      } = eval(`(${cfgCode})`)
      const m3u8 = unsafeObj.video.url
      return { text: '' + index, url: m3u8 }
    })
    return <IMovie>{
      id,
      title,
      desc,
      playlist: [
        { title: "默认", videos }
      ]
    }
  }
  async getSearch() {
    const wd = env.get<string>("keyword")
    const page = env.get("page")
    const _ = await req(`${env.baseUrl}/index/search_article`, {
      method: "POST",
      bodyType: "form",
      data: {
        word: wd,
        page,
      }
    })
    const obj: {
      data: {
        list: Array<{
        id: string,
        title: string,
        thumb: string,
      }>
      }
    } = JSON.parse(_)
    return obj.data.list.map<IMovie>(item => {
      return {
        id: item.id,
        cover: item.thumb,
        title: item.title,
        remark: "",
      }
    })
  }
}

// TEST
// const env = createTestEnv('https://3rh5s.cfvyjuz.com')
// const call = new 黑料网();
// ;(async ()=> {
//   const cates = await call.getCategory()
//   env.set("category", cates[0].id)
//   env.set("page", 1)
//   const home = await call.getHome()
//   env.set("keyword", "黑丝")
//   const search = await call.getSearch()
//   env.set("movieId", home[2].id)
//   const detail = await call.getDetail()
//   debugger
// })()