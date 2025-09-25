// import { kitty, req, createTestEnv } from "utils"

interface IItem {
  preview: string,
  previewImagesUrl: string
  preview_hp: string
  title: string,
  videoId: string
  code: string
  description: string
  srcs: Array<string>
  src: string
}

interface IData {
  docs: Array<IItem>
}

interface INextData {
  props: {
    initialState: {
      search: IData
      video: {
        data: IItem
      }
      all: IData
      censored: IData
      uncensored: IData
      trending: IData
    }
  }
}

// FIXME(d1y): 解析视频未完成
export default class NetFlav implements Handle {
  getConfig() {
    return <Iconfig>{
      id: 'netflav$',
      name: 'NetFlav',
      api: 'https://www.netflav.com',
      type: 1,
      nsfw: true,
    }
  }
  async getCategory() {
    return <ICategory[]>[
      {
        text: "最受欢迎",
        id: "trending"
      },
      {
        "text": "有码",
        "id": "censored"
      },
      {
        "text": "无码",
        "id": "uncensored"
      },
    ]
  }
  async getHome() {
    const cate = env.get("category") as "all" | "censored" | "uncensored" | "trending"
    const page = env.get("page")
    let url = `${env.baseUrl}/${cate}?page=${page}`
    const $ = kitty.load(await req(url))
    const script = $('#__NEXT_DATA__').text()
    const unsafeObj: INextData = JSON.parse(script)
    const data: IData = unsafeObj.props.initialState[cate]
    return data.docs.map<IMovie>(item => {
      return {
        id: item.videoId,
        cover: item.preview || item.preview_hp || item.previewImagesUrl,
        title: item.title,
        remark: item.code
      }
    })
  }
  async getDetail() {
    const id = env.get<string>("movieId")
    const url = `${env.baseUrl}/video?id=${id}`
    const $ = kitty.load(await req(url))
    const script = $('#__NEXT_DATA__').text()
    const json: INextData = JSON.parse(script)
    const data = json.props.initialState.video.data
    const urls: string[] = Array.from(new Set([data.src, ...(data.srcs ?? [])]))
    const playlist = <IPlaylist[]>[
      {
        title: "默认",
        videos: urls.map<IPlaylistVideo>((item, index) => {
          return { text: `源${index}`, id: item }
        })
      }
    ]
    return <IMovie>{
      id,
      cover: data.preview || data.preview_hp || data.previewImagesUrl,
      title: data.title,
      desc: data.description,
      playlist,
    }
  }
  async getSearch() {
    const wd = env.get<string>("keyword")
    const page = env.get("page")
    const url = `${env.baseUrl}/search?keyword=${wd}&page=${page}&type=title`
    const $ = kitty.load(await req(url))
    const script = $('#__NEXT_DATA__').text()
    const json: INextData = JSON.parse(script)
    const allvideos = json.props.initialState.search.docs
    return allvideos.map<IMovie>(item => {
      return {
        id: item.videoId,
        cover: item.preview || item.preview_hp || item.previewImagesUrl,
        title: item.title,
        remark: item.code
      }
    })
  }
  async parseIframe() {
    // TODO: impl this
    const iframe = env.get<string>("iframe")
    return ""
  }
}

// TEST
// const env = createTestEnv('https://www.netflav.com')
// const call = new NetFlav();
// ; (async () => {
//   const cates = await call.getCategory()
//   env.set("category", cates[0].id)
//   env.set("page", 1)
//   const home = await call.getHome()
//   env.set("movieId", home[0].id)
//   const detail = await call.getDetail()
//   debugger
// })()