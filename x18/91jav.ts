// import { kitty, req, createTestEnv } from 'utils'

export default class Re91Jav implements Handle {
  getConfig() {
    return <Iconfig>{
      id: "91jav$",
      name: "91Jav",
      type: 1,
      nsfw: true,
      api: "https://041.bndmpsjx.com",
    }
  }
  async getCategory() {
    let list: {
      name: string,
      ext: {
        typeurl: string,
      },
      ui: 1,
    }[] = []
    let ignore = ['首页']
    function isIgnoreClassName(className: string) {
      return ignore.some((element) => className.includes(element))
    }
    let classurl = `${env.baseUrl}/index/getMvStyle/order/count`

    const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1'
    const data = await req(classurl, {
      headers: {
        'User-Agent': UA,
      },
    })
    const $ = kitty.load(data)

    let allClass = $('.pb-3.pb-e-lg-40 .col-6.col-sm-4.col-lg-3')
    allClass.each((_, e) => {
      // https://041.bndmpsjx.com/cn/theme/detail/2/update/2
      const name = $(e).find('h3').text()
      let href = $(e).find('a').attr('href') ?? ""
      href = href.replace("/cn/theme/detail/", "").replace("/update/1", "")
      const isIgnore = isIgnoreClassName(name)
      if (isIgnore) return

      list.push({
        name,
        ext: {
          typeurl: href,
        },
        ui: 1,
      })
    })

    return list.map<ICategory>(item => {
      return { text: item.name, id: item.ext.typeurl }
    })
  }
  async getHome() {
    const cate = env.get("category")
    const page = env.get("page")
    const url = `${env.baseUrl}/cn/theme/detail/${cate}/update/${page}`
    const html = await req(url)
    const cards: {
      vod_id: string
      vod_name: string
      vod_pic: string
      vod_duration: string
      ext: {
        url: string
      }
    }[] = []
    const $ = kitty.load(html)
    $('.pb-3.pb-e-lg-40 .col-6.col-sm-4.col-lg-3').each((_, element) => {
      const href = $(element).find('.title a').attr('href') ?? ""
      const title = $(element).find('.title a').text()
      const cover = $(element).find('.zximg').attr('z-image-loader-url') ?? ""
      const subTitle = $(element).find('.label').text()
      cards.push({
        vod_id: href,
        vod_name: title,
        vod_pic: cover,
        vod_duration: subTitle,
        ext: {
          url: `${env.baseUrl}${href}`,
        },
      })
    })
    return cards.map<IMovie>((item => {
      return {
        id: item.vod_id,
        title: item.vod_name,
        cover: item.vod_pic,
        remark: item.vod_duration,
      }
    }))
  }
  async getDetail() {
    const id = env.get<string>("movieId")
    const url = `${env.baseUrl}${id}`
    const html = await req(url)
    const $ = kitty.load(html)
    const title = $("title").text()
    const cover = $("video").attr("data-src") ?? ""
    const m3u8 = html.match(/var hlsUrl = "(.*?)";/)![1]
    return <IMovie>{
      id, title, cover, playlist: [
        {
          title: "默认", videos: [
            { text: "😍播放", url: m3u8 }
          ]
        }
      ]
    }
  }

  async getSearch() {
    const wd = env.get<string>("keyword")
    const page = +env.get<number>("page")
    let url = `${env.baseUrl}/cn/search/${wd}/${page}`
    const html = await req(url)
    const cards: {
      vod_id: string
      vod_name: string
      vod_pic: string
      vod_duration: string
      ext: {
        url: string
      }
    }[] = []
    const $ = kitty.load(html)
    $('.pb-3.pb-e-lg-40 .col-6.col-sm-4.col-lg-3').each((_, element) => {
      const href = $(element).find('.title a').attr('href') ?? ""
      const title = $(element).find('.title a').text()
      const cover = env.baseUrl + $(element).find('img').attr('z-image-loader-url')
      const subTitle = $(element).find('.label').text()
      cards.push({
        vod_id: href,
        vod_name: title,
        vod_pic: cover,
        vod_duration: subTitle,
        ext: {
          url: `${env.baseUrl}${href}`,
        },
      })
    })
    return cards.map<IMovie>((item => {
      return {
        id: item.vod_id,
        title: item.vod_name,
        cover: item.vod_pic,
        remark: item.vod_duration,
      }
    }))
  }
}

// TEST
// const env = createTestEnv("https://041.bndmpsjx.com")
// const call = new Re91Jav();
// (async () => {
//   const cates = await call.getCategory()
//   env.set("category", cates[0].id)
//   env.set("page", 1)
//   const home = await call.getHome()
//   env.set("keyword", "黑丝")
//   const search = await call.getSearch()
//   env.set("movieId", search[2].id)
//   const detail = await call.getDetail()
//   debugger
// })()