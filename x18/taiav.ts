// import { createTestEnv, kitty, req, write  } from 'utils'

export default class taiav implements Handle {
  getConfig() {
    return <Iconfig>{
      id: 'taiav',
      name: 'Taiav',
      type: 1,
      api: 'https://taiav.com',
      nsfw: true,
    }
  }
  async getCategory() {
    return <ICategory[]>[
      { text: '最近更新', id: "news" },
      { text: '国产AV', id: "国产AV" },
      { text: '网红主播', id: "网红主播" },
      { text: '有码', id: "有码" },
      { text: '无码', id: "无码" },
    ]
  }
  async getHome() {
    let url = `${env.baseUrl}/cn/`
    const cate = env.get('category')
    const page = env.get('page')
    if (cate == 'news') {
      url += 'news'
    } else {
      url += `category/${cate}`
    }
    url += `?page=${page}`
    const html = await req(url)
    const $ = kitty.load(html)
    return $(`.videos-lists .movie-card`).toArray().map<IMovie | null>(item=> {
      const a = $(item).find('.uk-card-body a')
      const id = a.attr('href') ?? ""
      if (!id.startsWith("/cn/movie")) return null
      const imgEl = $(item).find('img[uk-cover]')
      const cover = imgEl.attr('src') ?? ""
      const title = imgEl.attr('alt') ?? ""
      const remark = $(item).find('.uk-tag.uk-type').text() ?? ""
      return {
        id,
        cover,
        title,
        remark,
        playlist: [],
      }
    }).filter(item=> !!item)
  }
  async getDetail() {
    const id = env.get<string>('movieId')
    const realId = id.replace('/cn/movie/', '')
    const html = await req(`${env.baseUrl}${id}`)
    const $ = kitty.load(html)
    const title = $('.uk-h4.uk-text-break').text()
    // const cover = ($('.player-poster.clickable').attr('style') ?? "").match(/"(\S*)"/)![1]
    const cover = html.match(/poster:\s*'([^']+)'/)![1]
    const m3u8API = `${env.baseUrl}/api/getmovie?type=1280&id=${realId}`
    const player = await req(m3u8API)
    const { m3u8 } = JSON.parse(player)
    const remark = $('.uk-padding-small .uk-grid-small.uk-grid div').toArray().map(item=> {
      return $(item).text()
    }).join(',')
    return <IMovie[]>[{
      id,
      title,
      cover,
      remark,
      playlist: [
        <IPlaylist>{ text: '高清', url: `${env.baseUrl}${m3u8}` }
      ]
    }]
  }
  async getSearch() {
    const url = `${env.baseUrl}/cn/search?q=${env.get('keyword')}&page=${env.get('page')}`
    const html = await req(url)
    const $ = kitty.load(html)
    return $(`.videos-lists .movie-card`).toArray().map<IMovie | null>(item=> {
      const a = $(item).find('.uk-card-body a')
      const id = a.attr('href') ?? ""
      if (!id.startsWith("/cn/movie")) return null
      const imgEl = $(item).find('img[uk-cover]')
      const cover = imgEl.attr('src') ?? ""
      const title = imgEl.attr('alt') ?? ""
      const remark = $(item).find('.uk-tag.uk-type').text() ?? ""
      return {
        id,
        cover,
        title,
        remark,
        playlist: [],
      }
    }).filter(item=> !!item)
  }
}

// TEST
// const env = createTestEnv('https://taiav.com', {
//   page: 1,
//   category: '网红主播',
//   keyword: '黑丝',
// })
// const call = new taiav()
// ;(async ()=> {
//   const home = await call.getHome()
//   env.set('movieId', home[0].id)
//   const searchs = await call.getSearch()
//   const detail =  await call.getDetail()
//   debugger
// })()