// import { kitty, req, createTestEnv } from 'utils'

export default class rouvideo implements Handle {
  getConfig() {
    return <Iconfig>{
      id: "rouvideo",
      name: "肉视频",
      type: 1,
      nsfw: true,
      api: "https://rouvz6.xyz/",
      extra: {
        gfw: true,
        searchLimit: 26,
      }
    }
  }

  async getCategory() {
    return <ICategory[]>[
      { text: "全部", id: "v" },
      { text: "日本", id: "日本" },
      { text: "OnlyFans", id: "OnlyFans" },
      { text: "自拍", id: "自拍流出" },
      { text: "国产", id: "国产AV" },
      { text: "探花", id: "探花" },
    ]
  }

  async getHome() {
    const cate = env.get("category")
    const page = env.get("page")
    let prefix = cate == 'v' ? 'v' : `/t/${cate}`
    const url = `${env.baseUrl}/${prefix}?order=createdAt&page=${page}`
    const html = await req(url)
    const $ = kitty.load(html)

    return $('.group.relative').toArray().map<IMovie | null>((element) => {
      const $el = $(element)
      const a = $el.find('a[href^="/v/"]').first()
      if (!a || a.length === 0) return null

      let href = a.attr('href') || ''
      if (href && !href.startsWith('http')) href = env.baseUrl + href

      const imgs = $el.find('img').toArray()
      let cover = ''
      if (imgs && imgs.length > 0) {
        cover = ($(imgs[imgs.length - 1]).attr('src') || $(imgs[0]).attr('src')) ?? ""
      } else {
        cover = $el.find('img').attr('src') || ''
      }

      // @ts-ignore
      const title = ($el.find('h3').text() || '').trim() || ($(imgs && imgs.length > 0) ? $(imgs[imgs.length - 1]).attr('alt') : '')
      const remarks = $el.find('.absolute.bottom-1.left-1').text().trim() || $el.find('.text-xs').text().trim() || ''

      return <IMovie>{ id: href, title, cover, remark: remarks }
    }).filter(item => !!item)
  }

  async getDetail() {
    const id = env.get<string>('movieId')
    const url = id
    const m = url.match(/\/v\/([^\/\?\#]+)/)
    const slug = m ? m[1] : null

    let playApi = slug ? `${env.baseUrl}/api/v/${slug}` : url
    const apiText = await req(playApi, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': url
      }
    })
    const apiObj: any = JSON.parse(apiText)

    let realUrl = ""

    // 优先从 HTML 提取完整 m3u8（带 auth）
    const html = await req(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': url }
    })
    const match = html.match(/"(https:[^"]+\.m3u8[^"]*auth=[^"]+)"/)
    if (match) {
      realUrl = match[1]
    } else {
      // fallback: 用 API 返回的
      realUrl = apiObj.video?.videoUrl || apiObj.video?.playUrl || apiObj.video?.hlsUrl || ""
      if (realUrl && !realUrl.includes("&auth=") && apiObj.video?.auth) {
        realUrl += `&auth=${apiObj.video.auth}`
      }
    }

    const playlist: IPlaylist[] = [{
      title: "默认",
      videos: [{ text: "😍播放", url: realUrl }]
    }]

    const $ = kitty.load(html)
    const title = $("title").text()
    const cover = $("video").attr("poster") ?? ""

    return { id, title, cover, playlist }
  }

  async getSearch() {
    const wd = env.get<string>("keyword")
    const page = env.get("page")

    function customEncodeURIComponent(str: string) {
      if (typeof str !== 'string') str = String(str)
      let result = ''
      for (let i = 0; i < str.length; i++) {
        const char = str.charAt(i)
        const charCode = char.charCodeAt(0)
        if (
          (charCode >= 97 && charCode <= 122) ||
          (charCode >= 65 && charCode <= 90) ||
          (charCode >= 48 && charCode <= 57) ||
          charCode === 45 || charCode === 95 ||
          charCode === 46 || charCode === 33 ||
          charCode === 126 || charCode === 42 ||
          charCode === 39 || charCode === 40 ||
          charCode === 41
        ) {
          result += char
        } else {
          if (charCode >= 0xD800 && charCode <= 0xDBFF) {
            if (i + 1 < str.length) {
              const nextCharCode = str.charCodeAt(i + 1)
              if (nextCharCode >= 0xDC00 && nextCharCode <= 0xDFFF) {
                const codePoint = (charCode - 0xD800) * 0x400 + (nextCharCode - 0xDC00) + 0x10000
                result += encodeCodePoint(codePoint)
                i++
                continue
              }
            }
          }
          result += encodeCodePoint(charCode)
        }
      }
      return result
    }

    function encodeCodePoint(codePoint: any) {
      let bytes = []
      if (codePoint <= 0x7F) {
        bytes.push(codePoint)
      } else if (codePoint <= 0x7FF) {
        bytes.push(0xC0 | (codePoint >> 6))
        bytes.push(0x80 | (codePoint & 0x3F))
      } else if (codePoint <= 0xFFFF) {
        bytes.push(0xE0 | (codePoint >> 12))
        bytes.push(0x80 | ((codePoint >> 6) & 0x3F))
        bytes.push(0x80 | (codePoint & 0x3F))
      } else if (codePoint <= 0x10FFFF) {
        bytes.push(0xF0 | (codePoint >> 18))
        bytes.push(0x80 | ((codePoint >> 12) & 0x3F))
        bytes.push(0x80 | ((codePoint >> 6) & 0x3F))
        bytes.push(0x80 | (codePoint & 0x3F))
      }
      return bytes.map(byte => '%' + byte.toString(16).toUpperCase()).join('')
    }

    const q = customEncodeURIComponent(wd)
    const url = `${env.baseUrl}/search?q=${q}&t=&page=${page}`
    const html = await req(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': url }
    })
    const $ = kitty.load(html)
    let cards: { vod_id: string, vod_name: string, vod_pic: string, vod_remarks: string }[] = []

    $('.group.relative').each((_, element) => {
      const $el = $(element)
      const a = $el.find('a[href^="/v/"]').first()
      if (!a || a.length === 0) return
      let href: string = a.attr('href') ?? ""
      if (href && !href.startsWith('http')) href = env.baseUrl + href

      const imgs = $el.find('img')
      let cover = ''
      if (imgs && imgs.length > 0) cover = ($(imgs[imgs.length - 1]).attr('src') || $(imgs[0]).attr('src')) ?? ""

      const title = ($el.find('h3').text() || '').trim()
      const remarks = $el.find('.absolute.bottom-1.left-1').text().trim() || ''

      cards.push({ vod_id: href, vod_name: title, vod_pic: cover, vod_remarks: remarks })
    })

    return cards.map<IMovie>(item => ({
      id: item.vod_id,
      title: item.vod_name,
      cover: item.vod_pic,
      remark: item.vod_remarks,
    }))
  }
}

// TEST
// const env = createTestEnv('https://rouvz6.xyz')
// const call = new rouvideo();
// (async () => {
//   const cates = await call.getCategory()
//   env.set('category', cates[2].id)
//   env.set('page', 1)
//   const home = await call.getHome()
//   env.set("keyword", "小宝探花")
//   env.set("page", 2)
//   const search = await call.getSearch()
//   env.set('movieId', home[0].id)
//   const detail = await call.getDetail()
//   debugger
// })()