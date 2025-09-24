// import { kitty, req, createTestEnv } from 'utils'

export default class rouvideo implements Handle {
  getConfig() {
    return <Iconfig>{
      id: "rouvideo$",
      name: "肉视频",
      type: 1,
      nsfw: true,
      api: "https://rou.video",
    }
  }
  async getCategory() {
    return <ICategory[]>[
      { text: "全部", id: "v" },
      { text: "日本", id: "日本" },
      { text: "OnlyFans", id: "OnlyFans" },
      { text: "自拍流出", id: "自拍流出" },
      { text: "国产AV", id: "国产AV" },
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
    // 从 XPTV 中抄过来的
    return $('.group.relative').toArray().map<IMovie | null>((element) => {
      const $el = $(element)
      const a = $el.find('a[href^="/v/"]').first()
      if (!a || a.length === 0) return null

      let href = a.attr('href') || ''
      if (href && !href.startsWith('http')) href = env.baseUrl + href

      // 有两个 img（背景 + 封面），选择最后一个作为封面
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
    // 从 detail url 中提取 slug，例如 /v/cmf0p9juh0000s6xhid0zoh5k
    const m = url.match(/\/v\/([^\/\?\#]+)/)
    const slug = m ? m[1] : null

    // 目前 rou.video 的播放数据通常来自 /api/v/{slug}
    // 我们把这个 API 作为播放入口（getPlayinfo 会去拿真实 m3u8/mp4）
    let playApi = ''
    if (slug) {
      playApi = `${env.baseUrl}/api/v/${slug}`
    } else {
      // 如果无法提取 slug，就把 detail 页面当作入口（getPlayinfo 会做容错）
      playApi = url
    }
    const apiText = await req(playApi, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
        'Referer': url
      }
    })
    const apiObj: { video: { videoUrl: string } } = JSON.parse(apiText)

    const playlist: IPlaylist[] = [{
      title: "默认",
      videos: [
        { text: "😍播放", url: apiObj.video.videoUrl }
      ]
    }]

    const $ = kitty.load(await req(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
        'Referer': url
      }
    }))
    const title = $("title").text()
    const cover = $("video").attr("poster") ?? ""
    return { id, title, cover, playlist }
  }

  async getSearch() {
    const wd = env.get<string>("keyword")
    const page = env.get("page")


    // 豆包
    function customEncodeURIComponent(str: string) {
      // 处理空字符串情况
      if (typeof str !== 'string') {
        str = String(str);
      }

      let result = '';

      // 遍历字符串的每个字符
      for (let i = 0; i < str.length; i++) {
        const char = str.charAt(i);
        const charCode = char.charCodeAt(0);

        // 不需要编码的字符范围
        if (
          // a-z
          (charCode >= 97 && charCode <= 122) ||
          // A-Z
          (charCode >= 65 && charCode <= 90) ||
          // 0-9
          (charCode >= 48 && charCode <= 57) ||
          // 特殊允许的字符: - _ . ! ~ * ' ( )
          charCode === 45 || charCode === 95 ||
          charCode === 46 || charCode === 33 ||
          charCode === 126 || charCode === 42 ||
          charCode === 39 || charCode === 40 ||
          charCode === 41
        ) {
          result += char;
        } else {
          // 需要编码的字符
          // 处理多字节字符（UTF-16 代理对）
          if (charCode >= 0xD800 && charCode <= 0xDBFF) {
            // 高代理项，需要与下一个低代理项组合
            if (i + 1 < str.length) {
              const nextCharCode = str.charCodeAt(i + 1);
              if (nextCharCode >= 0xDC00 && nextCharCode <= 0xDFFF) {
                // 计算完整的 Unicode 代码点
                const codePoint = (charCode - 0xD800) * 0x400 + (nextCharCode - 0xDC00) + 0x10000;
                result += encodeCodePoint(codePoint);
                i++; // 跳过下一个字符
                continue;
              }
            }
          }

          // 对单个字符进行编码
          result += encodeCodePoint(charCode);
        }
      }

      return result;
    }

    // 辅助函数：将 Unicode 代码点编码为 URI 格式
    function encodeCodePoint(codePoint: any) {
      let bytes = [];

      // 将代码点转换为 UTF-8 字节序列
      if (codePoint <= 0x7F) {
        bytes.push(codePoint);
      } else if (codePoint <= 0x7FF) {
        bytes.push(0xC0 | (codePoint >> 6));
        bytes.push(0x80 | (codePoint & 0x3F));
      } else if (codePoint <= 0xFFFF) {
        bytes.push(0xE0 | (codePoint >> 12));
        bytes.push(0x80 | ((codePoint >> 6) & 0x3F));
        bytes.push(0x80 | (codePoint & 0x3F));
      } else if (codePoint <= 0x10FFFF) {
        bytes.push(0xF0 | (codePoint >> 18));
        bytes.push(0x80 | ((codePoint >> 12) & 0x3F));
        bytes.push(0x80 | ((codePoint >> 6) & 0x3F));
        bytes.push(0x80 | (codePoint & 0x3F));
      }

      // 将每个字节转换为 %XX 格式
      return bytes.map(byte => '%' + byte.toString(16).toUpperCase()).join('');
    }

    const q = customEncodeURIComponent(wd)
    const url = `${env.baseUrl}/search?q=${q}&t=&page=${page}`
    const html = await req(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
        'Referer': url
      }
    })
    const $ = kitty.load(html)
    let cards: {
      vod_id: string,
      vod_name: string,
      vod_pic: string,
      vod_remarks: string,
    }[] = []

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

      cards.push({
        vod_id: href,
        vod_name: title,
        vod_pic: cover,
        vod_remarks: remarks,
      })
    })
    return cards.map<IMovie>(item => {
      return {
        id: item.vod_id,
        title: item.vod_name,
        cover: item.vod_pic,
        remark: item.vod_remarks,
      }
    })
  }
}

// TEST
// const env = createTestEnv('https://rou.video')
// const call = new rouvideo();
// (async () => {
//   const cates = await call.getCategory()
//   env.set('category', cates[2].id)
//   env.set('page', 1)
//   const home = await call.getHome()
//   env.set("keyword", "小宝探花")
//   env.set("page", 1)
//   const search = await call.getSearch()
//   env.set('movieId', home[0].id)
//   const detail = await call.getDetail()
//   debugger
// })()