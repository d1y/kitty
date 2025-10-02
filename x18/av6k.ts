// import { kitty, req, createTestEnv } from "utils"

// 来自群友 @CxiaoyuN
export default class AV6KSource implements Handle {
  getConfig() {
    return <Iconfig>{
      id: 'av6k',
      name: 'AV6K',
      api: 'https://av6k.com',
      nsfw: true,
      type: 1,
      extra: {
        gfw: true,
        searchLimit: 12,
      }
    };
  }

  async getCategory() {
    return <ICategory[]>[
      { id: 'rihanwuma', text: '日韓無碼' },
      { id: 'fc2', text: 'FC2無碼' },
      { id: 'rihanyouma', text: '日韓有碼' },
      { id: 'jxny', text: '中文字幕' },
      { id: 'chinese-av-porn', text: '國產AV' },
      { id: 'surenzipai', text: '自拍偷拍' },
      { id: 'oumeiwuma', text: '歐美無碼' },
      { id: 'chengrendongman', text: '成人動漫' },
    ];
  }

  async getHome() {
    const cate = env.get<string>('category') ?? '';
    const page = env.get<number>('page') ?? 1;

    let url = '';
    if (cate === '') {
      url = `${env.baseUrl}/`;
    } else if (page === 1) {
      url = `${env.baseUrl}/${cate}/`;
    } else {
      const html = await req(`${env.baseUrl}/${cate}/`);
      const $ = kitty.load(html);
      const link = $('.pages_c li a')
        .toArray()
        .find(a => $(a).text().trim() === `${page}`);
      const href = link ? $(link).attr('href') : null;
      url = href
        ? `${env.baseUrl}/${cate}/${href}`
        : `${env.baseUrl}/${cate}/`;
    }

    const $ = kitty.load(await req(url));
    return $('.listA').toArray().map(item => {
      const a = $(item).find('a');
      const title = a.attr('title')?.trim() ?? '';
      const id = a.attr('href') ?? '';
      const img = a.find('img').attr('src') ?? '';
      const cover = img.startsWith('/') ? `${env.baseUrl}${img}` : img;
      const preview = a.find('video').attr('srcmv') ?? '';
      const remark = $(item).find('.video-views').text().trim();
      const date = $(item).find('.video-added').text().trim();
      return {
        title,
        id,
        cover,
        preview,
        remark: `${remark} · ${date}`,
      };
    });
  }

  async getDetail() {
    const id = env.get<string>('movieId');
    const url = `${env.baseUrl}${id}`;
    const html = await req(url);
    const m3u8Match = html.match(/var\s+sp_m3u8\s*=\s*"([^"]+)"/);
    const m3u8 = m3u8Match ? m3u8Match[1] : '';
    const $ = kitty.load(html);
    // const title = $('title').text().trim();
    const title = ""
    return <IMovie>{
      title,
      playlist: [
        {
          title: '播放',
          videos: [{ text: '立即播放', url: m3u8 }],
        },
      ],
    };
  }

  async getSearch() {
    const keyword = env.get<string>('keyword');
    const page = env.get<number>('page') ?? 1;
    // FIXME(d1y): `encodeURIComponent` 在某些平台可能不存在?
    const url = `${env.baseUrl}/search/${encodeURIComponent(keyword)}-${page}.html`;
    const $ = kitty.load(await req(url));
    return $('.listA').toArray().map(item => {
      const a = $(item).find('a');
      const title = a.find(".listACT").text().trim()
      const id = a.attr('href') ?? '';
      const img = a.find('img').attr('src') ?? '';
      const cover = img.startsWith('/') ? `${env.baseUrl}${img}` : img;
      const preview = a.find('video').attr('srcmv') ?? '';
      const remark = $(item).find('.video-views').text().trim();
      const date = $(item).find('.video-added').text().trim();
      return {
        title,
        id,
        cover,
        preview,
        remark: `${remark} · ${date}`,
      };
    });
  }
}

// TEST
// const env = createTestEnv("https://av6k.com")
// const call = new AV6KSource();
// (async ()=> {
//   const cates = await call.getCategory()
//   env.set("category", cates[0].id)
//   env.set("page", 1)
//   const home = await call.getHome()
//   env.set("keyword", "无码")
//   const search = await call.getSearch()
//   env.set("movieId", search[0].id)
//   const detail = await call.getDetail()
//   debugger
// })()