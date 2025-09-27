// import { kitty, req, createTestEnv } from 'utils'

interface IGetInfoBody {
  RecordsPage: 20
  command: "WEB_GET_INFO"
  content: string
  languageType: "CN"
  pageNumber: number
  typeId: number | string
  typeMid: 1
  type?: 1
}

interface ICard {
  id: string
  type_Mid: 1
  typeName: string
  vod_class: string
  vod_name: string
  vod_pic: string
  vod_server_id: number
  vod_url: string
}

interface IGetDetailBody {
  command: "WEB_GET_INFO_DETAIL"
  id: string
  languageType: "CN"
  type_Mid: "1"
}

interface IInfoResponse {
  data: {
    count: string
    pageAllNumber: string
    pageNumber: string
    resultList: Array<ICard>
  }
}

interface IDetailResponse {
  data: {
    result: ICard
  }
}

export default class VV99KK implements Handle {
  getConfig() {
    return <Iconfig>{
      id: 'vv99kk',
      name: '熊猫视频',
      // 主站: https://www.vv99kk.com
      api: 'https://spiderscloudcn2.51111666.com',
      type: 1,
      nsfw: true,
      extra: {
        gfw: false,
        searchLimit: 20,
      }
    }
  }
  async getCategory() {
    return <ICategory[]>[
      {
        "id": "6",
        "text": "91传媒"
      },
      {
        "id": "7",
        "text": "精东传媒"
      },
      {
        "id": "8",
        "text": "麻豆传媒"
      },
      {
        "id": "9",
        "text": "麻豆映画"
      },
      {
        "id": "10",
        "text": "麻豆猫爪"
      },
      {
        "id": "11",
        "text": "蜜桃传媒"
      },
      {
        "id": "12",
        "text": "天美传媒"
      },
      {
        "id": "13",
        "text": "星空传媒"
      },
      {
        "id": "14",
        "text": "偷拍自拍"
      },
      {
        "id": "15",
        "text": "日韩视频"
      },
      {
        "id": "16",
        "text": "欧美性爱"
      },
      {
        "id": "17",
        "text": "智能换脸"
      },
      {
        "id": "18",
        "text": "经典三级"
      },
      {
        "id": "19",
        "text": "网红主播"
      },
      {
        "id": "20",
        "text": "台湾辣妹"
      },
      {
        "id": "21",
        "text": "onlyfans"
      },
      {
        "id": "22",
        "text": "中文字幕"
      },
      {
        "id": "23",
        "text": "经典素人"
      },
      {
        "id": "24",
        "text": "高清无码"
      },
      {
        "id": "25",
        "text": "美颜巨乳"
      },
      {
        "id": "26",
        "text": "丝袜制服"
      },
      {
        "id": "27",
        "text": "SM系列"
      },
      {
        "id": "28",
        "text": "欧美系列"
      },
      {
        "id": "29",
        "text": "H動畫"
      }
    ]
  }
  async getHome() {
    const cate = env.get<string>("category")
    const page = env.get("page")
    const unsafeObj: IInfoResponse = JSON.parse(await req(`${env.baseUrl}/forward`, {
      method: "POST",
      noCache: true,
      data: <IGetInfoBody>{
        RecordsPage: 20,
        command: "WEB_GET_INFO",
        content: "",
        languageType: "CN",
        pageNumber: page,
        typeId: cate,
        typeMid: 1,
      }
    }))
    return unsafeObj.data.resultList.map<IMovie>(item => {
      return {
        id: item.id,
        cover: item.vod_pic,
        title: item.vod_name,
        remark: item.vod_class,
      }
    })
  }
  async getDetail() {
    const id = env.get<string>("movieId")
    const response: IDetailResponse = JSON.parse(await req(`${env.baseUrl}/forward`, {
      method: "POST",
      noCache: true,
      data: <IGetDetailBody>{
        command: "WEB_GET_INFO_DETAIL",
        id,
        languageType: "CN",
        type_Mid: "1",
      }
    }))
    const _ = response.data.result

    const initObj: {
      data: {
        macVodLinkMap: Record<string, Record<string, string>>
      }
    } = JSON.parse(await req(`${env.baseUrl}/getDataInit`, {
      method: "POST",
      data: {
        age: 31,
        city: "New York",
        name: "John"
      }
    }))

    const xl1 = initObj.data.macVodLinkMap

    let playUrl = ""
    let xl: any = false
    const num = Math.floor(Math.random() * 2 + 1);
    // var playImgUrl = "";
    if (null != xl) {
      // playImgUrl = xl1[response.data.result.vod_server_id].PIC_LINK_1 + response.data.result.vod_pic;
      if (xl == 1) {
        playUrl = xl1[response.data.result.vod_server_id].LINK_1 + response.data.result.vod_url;
      } else if (xl == 2) {
        playUrl = xl1[response.data.result.vod_server_id].LINK_2 + response.data.result.vod_url;
      } else if (xl == 3) {
        playUrl = xl1[response.data.result.vod_server_id].LINK_3 + response.data.result.vod_url;
      } else {
        if (num == 1) {
          playUrl = xl1[response.data.result.vod_server_id].LINK_1 + response.data.result.vod_url;
          console.log(1);
        } else if (num == 2) {
          playUrl = xl1[response.data.result.vod_server_id].LINK_2 + response.data.result.vod_url;
          console.log(2);
        } else {
          playUrl = xl1[response.data.result.vod_server_id].LINK_1 + response.data.result.vod_url;
          console.log(3);
        }
      }
    }

    return <IMovie>{
      id,
      title: _.vod_name,
      playlist: [
        {
          title: "默认",
          videos: [
            {
              url: playUrl,
              text: "播放",
            }
          ]
        }
      ]
    };
  }
  async getSearch() {
    const wd = env.get<string>("keyword")
    const page = env.get("page")
    const unsafeObj: IInfoResponse = JSON.parse(await req(`${env.baseUrl}/forward`, {
      method: "POST",
      noCache: true,
      data: <IGetInfoBody>{
        RecordsPage: 20,
        command: "WEB_GET_INFO",
        content: wd,
        languageType: "CN",
        pageNumber: page,
        type: 1,
        typeMid: 1,
        typeId: 0,
      }
    }))
    return unsafeObj.data.resultList.map<IMovie>(item => {
      return {
        id: item.id,
        cover: item.vod_pic,
        title: item.vod_name,
        remark: item.vod_class,
      }
    })
  }
}

// TEST
// const env = createTestEnv(`https://spiderscloudcn2.51111666.com`)
// const call = new VV99KK();
// (async () => {
//   const cates = await call.getCategory()
//   env.set("category", cates[0].id)
//   env.set("page", 1)
//   const home = await call.getHome()
//   env.set("movieId", home[0].id)
//   const detail = await call.getDetail()
//   env.set("keyword", "黑丝")
//   const search = await call.getSearch()
//   debugger
// })()