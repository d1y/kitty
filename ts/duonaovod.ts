// import { kitty, req, createTestEnv } from 'utils'

export default class duonaovod implements Handle {
  getConfig() {
    return <Iconfig>{
      id: 'duonaovod',
      name: '多瑙影院',
      api: "https://www.duonaovod.com",
      nsfw: false,
      type: 1
    }
  }

  async getCategory() {
    return <ICategory[]>[
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
    const url = `${env.baseUrl}/index.php/vod/type/id/${cate}/page/${page}.html`
    const html = await req(url)
    const $ = kitty.load(html)
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
    const html = await req(url)
    const $ = kitty.load(html)
    const box = $(".conch-ctwrap-auto .container .hl-row-box")
    const div = box.find(".hl-item-thumb.hl-lazy")
    const title = div.attr("title") ?? ""
    const cover = div.attr("data-original") ?? ""
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
    return <IMovie>{ id, title, cover, playlist }
  }
  async getSearch() {
    const wd = env.get("keyword")
    const page = env.get("page")
    const url = `${env.baseUrl}/index.php/vod/search/page/${page}/wd/${wd}.html`
    const html = await req(url)
    const $ = kitty.load(html)
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

    // 豆包
    function customUnescape(str: string) {
      // 匹配 %xx 或 %uxxxx 格式的转义序列
      return str.replace(/%u([0-9A-Fa-f]{4})|%([0-9A-Fa-f]{2})/g,
        function (match, unicodeHex, hex) {
          if (unicodeHex) {
            // 处理 Unicode 字符 %uXXXX 格式
            return String.fromCharCode(parseInt(unicodeHex, 16));
          } else {
            // 处理 ASCII 字符 %XX 格式
            return String.fromCharCode(parseInt(hex, 16));
          }
        }
      );
    }

    // https://github.com/cipherxof/w3ts/blob/8a11908a7d773873d80669d4c02dcc74d6f6ffec/system/base64.ts#L44
    function base64Decode(input: string) {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      let i = input.length;
      for (; i > 0 && input[i] !== "="; i--) {
        /* do nothing */
      }
      const str = input.substr(0, i - 1);
      let output = "";
      if (str.length % 4 === 1) {
        return output;
      }
      let bs = 0;
      // tslint:disable-next-line:no-conditional-assignment
      for (
        let bc = 0, buffer, idx = 0;
        (buffer = str.charAt(idx));
        ~buffer && ((bs = bc % 4 !== 0 ? bs * 64 + buffer : buffer), bc++ % 4) !== 0
          ? (output += String.fromCharCode(255 & (bs >>> ((-2 * bc) & 6))))
          : 0
      ) {
        if (`${buffer}`.length === 0) {
          break;
        }
        buffer = chars.indexOf(buffer);
        idx++;
      }
      return output;
    }

    // 逆向自 https://www.duonaovod.com/static/js/player.js?t=a20250923
    if (unsafeObj.encrypt == '1') {
      unsafeObj.url = unescape(unsafeObj.url);
    } else if (unsafeObj.encrypt == '2') {
      unsafeObj.url = unescape(base64Decode(unsafeObj.url));
    }
    return unsafeObj.url
  }
}

// TEST
// const env = createTestEnv("https://www.duonaovod.com")
// const tv = new duonaovod();
// (async () => {
//   const cates = await tv.getCategory()
//   env.set("category", cates[0].id)
//   env.set("page", 1)
//   const home = await tv.getHome()
//   env.set('keyword', '我能')
//   const search = await tv.getSearch()
//   env.set("movieId", search[0].id)
//   const detail = await tv.getDetail()
//   env.set("iframe", detail.playlist![0].videos[0].id)
//   const realM3u8 = await tv.parseIframe()
//   debugger
// })()