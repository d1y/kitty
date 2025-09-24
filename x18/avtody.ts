// import { kitty, req, createTestEnv } from 'utils'

export default class Avtody implements Handle {
  getConfig() {
    return <Iconfig>{
      id: "avtody$",
      name: "Avtody",
      type: 1,
      nsfw: true,
      api: "https://avtoday.io",
    }
  }
  async getCategory() {
    let list: any[] = []
    let ignore: any[] = []
    function isIgnoreClassName(className: string) {
      return ignore.some((element) => className.includes(element))
    }
    const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

    const data = await req(env.baseUrl + '/catalog', {
      headers: {
        'User-Agent': UA,
      },
    })
    const $ = kitty.load(data)

    let allClass = $('.swiper-wrapper > .swiper-slide')
    allClass.each((_, e) => {
      const name = $(e).find('.btn-categories__title').text()
      const info = $(e).find('.btn-categories__info').text().split(' ')[0]
      const href = $(e).find('a.btn-categories').attr('href')
      const isIgnore = isIgnoreClassName(name)
      if (isIgnore) return

      list.push({
        name: `${name} (${info})`,
        ext: {
          url: href,
        },
        ui: 1,
      })
    })
    return list.filter(item => !!item.ext.url).map<ICategory>((item: any) => {
      return { text: item.name, id: item.ext.url }
    })
  }
  async getHome() {
    const cate = env.get('category')
    const page = env.get("page")
    const url = `${cate}?page=${page}`
    const $ = kitty.load(await req(url))
    return $('.thumbnail').toArray().map<IMovie | null>(element => {
      const __text = $(element).text()
      if (__text.includes("广告") || __text.includes("廣告")) return null
      const href = $(element).find('.video-title a').attr('href')
      const title = $(element).find('.video-title a').text()
      const _videoStyle = ($(element).find("video").attr("style") ?? "")
      let cover = _videoStyle.match(/url\('(\S*)'\)/)![1]
      cover = `${env.baseUrl}${cover}`
      const subTitle = $(element).find('.video-tag').text().trim() || ''
      return <IMovie>{
        id: href,
        title,
        cover,
        remark: subTitle,
      }
    }).filter(item => !!item)
  }
  async getSearch() {
    // FIXME(d1y): 搜索有CF墙
    const wd = env.get<string>("keyword")
    const page = env.get("page")
    const url = `${env.baseUrl}/search?s=${wd}&page=${page}`
    const $ = kitty.load(await req(url))
    return $('.thumbnail').toArray().map<IMovie | null>(element => {
      const __text = $(element).text()
      if (__text.includes("广告") || __text.includes("廣告")) return null
      const href = $(element).find('.video-title a').attr('href')
      const title = $(element).find('.video-title a').text()
      const _videoStyle = ($(element).find("video").attr("style") ?? "")
      let cover = _videoStyle.match(/url\('(\S*)'\)/)![1]
      cover = `${env.baseUrl}${cover}`
      const subTitle = $(element).find('.video-tag').text().trim() || ''
      return <IMovie>{
        id: href,
        title,
        cover,
        remark: subTitle,
      }
    }).filter(item => !!item)
  }
  async getDetail() {
    const id = env.get<string>("movieId")
    const url = `${env.baseUrl}${id}`
    const $ = kitty.load(await req(url))
    const title = $(`meta[property="og:title"]`).text()
    const cover = $(`meta[property="og:image"]`).text()
    const iframe = $('.video-frame').attr("src")
    const playlist = <IPlaylist[]>[{
      title: "默认",
      videos: [
        { text: "😍播放", id: iframe }
      ]
    }]
    return <IMovie>{
      id,
      title,
      cover,
      playlist,
    }
  }
  async parseIframe() {
    const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    const iframe = env.get<string>("iframe")
    const realId = iframe.match(/\?s=(\S*)/)![1]
    const referer = `${env.baseUrl}/video/${realId}`
    const html = await req(`${env.baseUrl}${iframe}`, {
      headers: {
        'User-Agent': UA,
        Referer: referer,
      }
    })
    return html.match(/var m3u8_url = '(.*?)';/)![1]
  }
}

// TEST
// const env = createTestEnv("https://avtoday.io")
// const call = new Avtody();
// (async () => {
//   const cates = await call.getCategory()
//   env.set("category", cates[0].id)
//   env.set("page", 1)
//   const home = await call.getHome()
//   env.set("keyword", "无码")
//   const search = await call.getSearch()
//   env.set("movieId", search[0].id)
//   env.set("movieId", home[0].id)
//   const detail = await call.getDetail()
//   env.set("iframe", detail.playlist![0].videos[0].id)
//   const realM3u8 = await call.parseIframe()
//   debugger
// })()