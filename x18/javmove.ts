// import { kitty, req, createTestEnv } from 'utils'

export default class JavMove implements Handle {
  getConfig() {
    return <Iconfig>{
      id: "javmove$",
      name: "JavMove",
      type: 1,
      nsfw: true,
      api: "https://javmove.com",
      extra: {
        gfw: true,
      }
    }
  }
  async getCategory() {
    return <ICategory[]>[
      { text: "最新AV", id: "release" },
      { text: "即将上映", id: "upcoming" },
    ]
  }
  async getHome() {
    const cate = env.get("category")
    const page = env.get("page")
    const url = `${env.baseUrl}/${cate}?page=${page}`
    const html = await req(url)
    const $ = kitty.load(html)
    return $("#movie-list article").toArray().map<IMovie>(element => {
      const id = $(element).find('a[rel="bookmark"]').attr("href") ?? ""
      const title = $(element).find("h2").attr("title")!.split(" ")[0];
      const cover =
        ($(element).find(".movie-image").attr("data-srcset") ||
          $(element).find(".movie-image").attr("src")) ?? ""
      return { id, title, cover, remark: "" }
    })
  }
  async getDetail() {
    const UA =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0.1 Mobile/15E148 Safari/604.1";
    const id = env.get<string>("movieId")
    const url = `${env.baseUrl}${id}`
    const html = await req(url)
    const $ = kitty.load(html)
    const videoId = $("#video-player").attr("data-id") || ""
    // 从XPTV中抄过来的
    const promises = $(".video-format").toArray().map(async element => {
      const format = $(element).find(".video-format-header").text().trim();
      let formatGroup = { title: <string>format, tracks: <{ part: number, name: string, ext: { dataID: string } }[]>[] };
      const partElements = $(element).find(".video-source-btn");
      for (const partEl of partElements.toArray()) {
        const href = $(partEl).attr("href") || "";
        const partMatch = $(partEl).attr("title")!.match(/part\s*(\d+)/i);
        const partNumber = partMatch ? parseInt(partMatch[1], 10) : 0;
        const title = `part ${partNumber}`;
        let dataID: string;
        if (href.includes("#")) {
          dataID = videoId;
        } else {
          const curl = `${env.baseUrl}${href}`;
          const data2 = await req(curl, {
            headers: { "User-Agent": UA, Referer: url },
          });
          const $2 = kitty.load(data2);
          dataID = $2("#video-player").attr("data-id") ?? "";
        }
        formatGroup.tracks.push({
          part: partNumber,
          name: title,
          ext: { dataID },
        });
      }
      return formatGroup
    })
    const _ = await Promise.all(promises);
    const playlist: IPlaylist[] = _.map(({ title, tracks })=> {
      return { title, videos: tracks.map<IPlaylistVideo>(item=> {
        return { text: item.name, id: item.ext.dataID }
      }) }
    })
    const title = $(".text-2xl.font-bold.text-gray-100.mb-4.flex.items-center").text().trim()
    const cover = $(".w-full.h-full.lazyloaded").attr("data-srcset") ?? ""
    return <IMovie>{ id, title, cover, playlist }
  }

  async parseIframe() {
    const UA =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0.1 Mobile/15E148 Safari/604.1";
    const id = env.get<string>("iframe")
    const api = `${env.baseUrl}/watch?token=${id}`
    const data = await req(api, {
      headers: {
        "User-Agent": UA,
        Referer: "https://javquick.com/",
      },
    })
    return data
  }
}

// TEST
// const env = createTestEnv('https://javmove.com')
// const call = new JavMove();
// (async () => {
//   const cates = await call.getCategory()
//   env.set('category', cates[0].id)
//   env.set('page', 1)
//   const home = await call.getHome()
//   env.set('movieId', home[0].id)
//   const detail = await call.getDetail()
//   env.set("iframe", detail.playlist![0].videos[0].id)
//   const m3u8 = await call.parseIframe()
//   debugger
// })()