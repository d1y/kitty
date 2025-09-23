// import { kitty, req, createTestEnv, write } from 'utils'

export default class avple implements Handle {
  getConfig() {
    return <Iconfig>{
      id: 'avple',
      name: 'AVPLE',
      api: "https://avple.tv",
      type: 1,
      nsfw: true,
    }
  }
  async getCategory() {
    return <ICategory[]>[
      { text: "麻豆传媒", id: "121" },
      { text: "果冻传媒", id: "123" },
      { text: "皇家华人", id: "124" },
      { text: "精东影业", id: "125" },
      { text: "天美传媒", id: "126" },
      { text: "星空无限传媒", id: "127" },
      { text: "乐博传媒", id: "128" },
      { text: "蜜桃传媒", id: "129" },
      { text: "乌鸦传媒", id: "130" },
      { text: "国产自拍", id: "131" },
      { text: "SWAG", id: "132" },
      { text: "FC2PPV", id: "135" },
    ]
  }
  async getHome() {
    const cate = env.get("category")
    const page = env.get("page")
    const url = `${env.baseUrl}/tags/${cate}/${page}/date`
    const html = await req(url)
    const $ = kitty.load(html)
    let code = ($("script#__NEXT_DATA__").text() ?? "")
    code = `(${code})`
    const unsafeObj: {
      props: {
        pageProps: {
          data: Array<{
            title: string,
            img_preview: string,
            _id: string,
            tags: string[],
          }>
        }
      }
    } = eval(code)
    return unsafeObj.props.pageProps.data.map<IMovie>(item => {
      let remark = ""
      if (!!item.tags.length) {
        remark = item.tags[0]
      }
      return { id: item._id, title: item.title, cover: item.img_preview, remark }
    })
  }

  async getDetail() {
    const id = env.get("movieId")
    const url = `${env.baseUrl}/video/${id}`
    const html = await req(url)
    const $ = kitty.load(html)
    let code = ($("script#__NEXT_DATA__").text() ?? "")
    code = `(${code})`
    const unsafeObj: {
      props: {
        pageProps: {
          instance: {
            img_normal: string,
            key_words: string[],
            play: string,
            play_source_type: 18
            title: string,
            release: string
          }
        }
      }
    } = eval(code)

    let m3u8 = unsafeObj.props.pageProps.instance.play

    // 逆向自 https://asserts.avple.tv/file/avple-asserts/_next/static/chunks/pages/video/%5B_id%5D-cdb319e60d09d88b.js
    function getRealM3u8(type: number, m3u8: string) {
      let full_domain = ["d862cp.cdnedge.live", "q2cyl7.cdnedge.live", "u89ey.cdnedge.live", "zo392.cdnedge.live", "wo880.cdnedge.live", "6m7d.cdnedge.live", "8bb88.cdnedge.live", "fa678.cdnedge.live", "pg2z7.cdnedge.live", "1xp60.cdnedge.live", "47b61.cdnedge.live", "i3qss.cdnedge.live", "10j99.cdnedge.live", "je40u.cdnedge.live", "f125c.cdnedge.live", "w9n76.cdnedge.live", "s6s6u.cdnedge.live", "rup0u.cdnedge.live", "e2fa6.cdnedge.live", "t4tm6.cdnedge.live", "w083g.cdnedge.live"]
      const _domain = full_domain.map(e => e.split(".")[0] + "1.cdnedge.live")
      const domains = {
        stream_MD_CDN: full_domain,
        stream_SWAG_CDN: full_domain,
        stream_HOME_MADE_CDN: full_domain,
        stream_US_CDN: full_domain,
        stream_US_CDN1: _domain,
        stream_MD_CDN1: _domain,
        stream_SWAG_CDN1: _domain,
        stream_HOME_MADE_CDN1: _domain,
        classic_jav: ["hqua8q61at.cdnedge.live"]
      }
      switch (type) {
        case 5:
          return `${env.baseUrl}/${m3u8}`
        case 7:
        case 8:
          let e = domains.stream_US_CDN
          const r = Math.floor(Math.random() * e.length)
          return "https://".concat(e[r], "/file/avple-images/").concat(m3u8)
        case 12:
          let e1 = domains.stream_MD_CDN1;
          var r1 = Math.floor(Math.random() * e1.length);
          return "https://".concat(e1[r1], "/file/avple-asserts/").concat(m3u8)
        case 13:
          let e2 = domains.stream_SWAG_CDN1;
          var r2 = Math.floor(Math.random() * e2.length);
          return "https://".concat(e2[r2], "/file/avple-asserts/").concat(m3u8)
        case 14:
          let e3 = domains.stream_HOME_MADE_CDN1;
          var r3 = Math.floor(Math.random() * e3.length);
          return "https://".concat(e3[r3], "/file/avple-asserts/").concat(m3u8)
        case 17:
        case 18:
          let e4 = domains.stream_US_CDN1;
          var r4 = Math.floor(Math.random() * e4.length);
          return "https://".concat(e4[r4], "/file/avple-asserts/").concat(m3u8)
      }
    }
    
    const realM3u8 = getRealM3u8(unsafeObj.props.pageProps.instance.play_source_type, m3u8)
    return <IMovie>{
      id,
      title: unsafeObj.props.pageProps.instance.title,
      cover: unsafeObj.props.pageProps.instance.img_normal,
      desc: unsafeObj.props.pageProps.instance.key_words.join(","),
      playlist: [{
        title: "avple", videos: [
          {
            text: unsafeObj.props.pageProps.instance.release,
            url: realM3u8,
          }
        ]
      }]
    }
  }
  async getSearch() {
    const wd = env.get("keyword")
    const page = env.get("page")
    const url = `https://avple.tv/search?key=${wd}&page=${page}`
    const html = await req(url)
    const $ = kitty.load(html)
    let code = ($("script#__NEXT_DATA__").text() ?? "")
    code = `(${code})`
    const unsafeObj: {
      props: {
        pageProps: {
          data: Array<{
            title: string,
            img_preview: string,
            _id: string,
            tags: string[],
          }>
        }
      }
    } = eval(code)
    return unsafeObj.props.pageProps.data.map<IMovie>(item => {
      let remark = ""
      if (!!item.tags.length) {
        remark = item.tags[0]
      }
      return { id: item._id, title: item.title, cover: item.img_preview, remark }
    })
  }
}

// TEST
// const env = createTestEnv("https://avple.tv")
// const tv = new avple();
// (async () => {
//   const cates = await tv.getCategory()
//   env.set("category", cates[0].id)
//   env.set("page", 1)
//   const home = await tv.getHome()
//   env.set('keyword', '我能')
//   const search = await tv.getSearch()
//   env.set("movieId", search[0].id)
//   const detail = await tv.getDetail()
//   debugger
// })()