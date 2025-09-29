// import { kitty, req, createTestEnv } from 'utils'

export default class ThePornCC implements Handle {
  getConfig() {
    return <Iconfig>{
      id: "ThePornCC",
      name: "ThePorn",
      nsfw: true,
      api: "https://theporn.cc",
      extra: {
        gfw: true,
        searchLimit: 28,
      }
    }
  }
  async getCategory() {
    return <ICategory[]>[
      { id: "categories/all", text: "全部" },
      { id: "jav", text: "日本AV" },
      { id: "jav/uncensored", text: "日本无码" },
      { id: "eu", text: "欧美" },
      { id: "vr", text: "VR" },
      { id: "cartoon", text: "卡通动漫" },
    ]
  }
  async getHome() {
    const cate = env.get<string>("category")
    const page = env.get<number>("page")
    const url = `${env.baseUrl}/${cate}/${page}`
    const $ = kitty.load(await req(url))
    return $(".video-list .avdata-outer").toArray().map(item => {
      const img = $(item).find("img")
      const title = img.attr("alt") ?? ""
      const cover = img.attr("data-src") ?? ""
      const id = $(item).find("a").attr("href") ?? ""
      const remark = $(item).find(".title_fanhao").text()
      return <IMovie>{
        id,
        title,
        cover,
        remark,
      }
    })
  }
  async getDetail() {
    const id = env.get<string>("movieId")
    const url = `${env.baseUrl}/${id}`
    const text = await req(url)
    const $ = kitty.load(text)
    const result = <IMovie>{}
    $("script").map((_, item) => {
      const text = $(item).text()
      if (!text) return;
      if (text.includes("VideoObject")) {
        const unsaefVO: {
          name: string
          description: string
          thumbnailUrl: string
          duration: string
          embedUrl: string
        } = JSON.parse(text)
        result.cover = unsaefVO.thumbnailUrl
        result.title = unsaefVO.name
      }
      if (text.includes("avdata_source")) {
        let parse = text.replace("var avdata_source='", "")
        const endIndex = parse.indexOf("';$g.avd")
        parse = parse.slice(0, endIndex)
        const unsafeData: {
          hash_id: string
          release_time_format: string
          space_hosts: Array<[
            string, // alias?
            string, // name
            string, // host
          ]>
          static_host: string
          tid: string
        } = JSON.parse(parse)
        const id = unsafeData.hash_id
        const videos = unsafeData.space_hosts.map<IPlaylistVideo>(item => {
          const url = "https://" + item[2] + "/videos/" + id + "/g.m3u8";
          return { text: item[1], url, }
        })
        result.playlist = [{ title: unsafeData.tid, videos }]
      }
      if (text.includes("var av_response")) {
        let parse = text.replace("var av_response='", "")
        const endIndex = parse.indexOf("';$g.av")
        parse = parse.slice(0, endIndex)
        try {
          const unsafeResponse: {
            cover_image_url: string
            hash_id: string
            m3u8_url: string
          } = JSON.parse(parse)
        } catch (error) {
          console.error(error)
        }
      }
    })
    return result
  }
  async getSearch() {
    const wd = env.get<string>("keyword")
    const page = env.get<number>("page")
    const url = `${env.baseUrl}/search/${wd}/${page}?`
    const $ = kitty.load(await req(url))
    return $(".video-list .avdata-outer").toArray().map(item => {
      const img = $(item).find("img")
      const title = img.attr("alt") ?? ""
      const cover = img.attr("data-src") ?? ""
      const id = $(item).find("a").attr("href") ?? ""
      const remark = $(item).find(".title_fanhao").text()
      return <IMovie>{
        id,
        title,
        cover,
        remark,
      }
    })
  }
}

// TEST
// const env = createTestEnv("https://theporn.cc")
// const call = new ThePornCC();
// (async () => {
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