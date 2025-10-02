// import { kitty, req, createTestEnv } from "utils"

// 来自群友 @CxiaoyuN
export default class Madou implements Handle {
  getConfig() {
    return <Iconfig>{
      id: 'madou',
      name: '麻豆社',
      api: 'https://madou.club',
      nsfw: true,
      type: 1,
      extra: {
        gfw: true,
        searchLimit: 20,
      }
    }
  }

  async getCategory() {
    return <ICategory[]>[
      { text: '麻豆传媒', id: 'category/%e9%ba%bb%e8%b1%86%e4%bc%a0%e5%aa%92' },
      { text: '麻豆番外篇', id: 'category/%e9%ba%bb%e8%b1%86%e7%95%aa%e5%a4%96%e7%af%87' },
      { text: '果冻传媒', id: 'category/%e6%9e%9c%e5%86%bb%e4%bc%a0%e5%aa%92' },
      { text: '天美传媒', id: 'category/%e5%a4%a9%e7%be%8e%e4%bc%a0%e5%aa%92' },
      { text: '皇家华人', id: 'category/%e7%9a%87%e5%ae%b6%e5%8d%8e%e4%ba%ba' },
      { text: '精东影业', id: 'category/%e7%b2%be%e4%b8%9c%e5%bd%b1%e4%b8%9a' },
    ]
  }

  async getHome() {
    const cate = env.get<string>('category') || ''
    const page = env.get<number>('page') || 1
    let url = `${env.baseUrl}/`
    if (cate) url += `${cate}/`
    if (page > 1) url += `page/${page}/`

    const html = await req(url)
    const $ = kitty.load(html)

    return $('article.excerpt').toArray().map<IMovie>(el => {
      const a = $(el).find('h2 a')
      const id = a.attr('href') ?? ''
      const title = a.text().trim()
      let cover = $(el).find('img').attr('data-src') ?? ''
      if (cover.startsWith('//')) cover = 'https:' + cover
      const remark = $(el).find('.post-view').text().trim()
      return { id, title, cover, desc: '', remark, playlist: [] }
    })
  }

  async getDetail() {
    const id = env.get<string>('movieId')
    const url = id.startsWith('http') ? id : `${env.baseUrl}${id}`
    const html = await req(url)
    const $ = kitty.load(html)

    const title = $('h1').text().trim()
    let cover = $('article img').first().attr('src') ?? ''
    if (cover.startsWith('//')) cover = 'https:' + cover
    const desc = $('article').text().slice(0, 200).trim()

    // 提取 iframe
    const iframeUrl = $('iframe').attr('src') ?? ''

    let realUrl = ''
    if (iframeUrl) {
      const iframeHtml = await req(iframeUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Referer': url
        }
      })
      const tokenMatch = iframeHtml.match(/var token = "([^"]+)"/)
      const token = tokenMatch ? tokenMatch[1] : ""

      const m3u8Match = iframeHtml.match(/var m3u8 = '([^']+)'/)
      const m3u8Path = m3u8Match ? m3u8Match[1] : ""

      if (m3u8Path && token) {
        realUrl = `https://dash.madou.club${m3u8Path}?token=${token}`
      }
    }

    const playlist = [{
      title: '默认',
      videos: realUrl
        ? [{ text: '在线播放', url: realUrl }]
        : [{ text: '打开详情页', id: url }]
    }]

    return <IMovie>{ id: url, title, cover, desc, playlist }
  }

  async getSearch() {
    const wd = env.get<string>('keyword') || ''
    const page = env.get<number>('page') || 1
    const url = `${env.baseUrl}/page/${page}/?s=${encodeURIComponent(wd)}`
    const html = await req(url)
    const $ = kitty.load(html)

    return $('article.excerpt').toArray().map<IMovie>(el => {
      const a = $(el).find('h2 a')
      const id = a.attr('href') ?? ''
      const title = a.text().trim()
      let cover = $(el).find('img').attr('data-src') ?? ''
      if (cover.startsWith('//')) cover = 'https:' + cover
      return { id, title, cover, desc: '', remark: '搜索结果', playlist: [] }
    })
  }
}

// TEST
// const env = createTestEnv("https://madou.club")
// const call = new Madou();
// (async ()=> {
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