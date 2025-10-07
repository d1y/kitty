export default class OmofunSource implements Handle {
  getConfig() {
    return {
      id: 'omofun',
      name: 'Omofun_WEB',
      api: 'https://omofun.link',
      type: 1,
      nsfw: false,
    };
  }

  async getCategory() {
    return [
      { text: '动漫', id: '4' },
      { text: '里番', id: '5' },
    ];
  }

  async getHome() {
    const cate = env.get('category');
    const page = env.get('page');
    const url = `${env.baseUrl}/vod/show/id/${cate}/page/${page}.html`;
    const html = await req(url);
    const $ = kitty.load(html);

    return $('.module-poster-item').toArray().map(item => {
      const img = $(item).find('img.lazy');
      const id = $(item).attr('href') ?? '';
      const title = img.attr('alt') ?? '';
      let cover = img.attr('data-original') ?? '';
      if (cover.startsWith('//')) cover = 'https:' + cover;
      const remark = $(item).find('.module-item-note').text() ?? '';
      return { id, title, cover, desc: '', remark, playlist: [] };
    });
  }

  async getDetail() {
    const id = env.get('movieId');
    const url = `${env.baseUrl}${id}`;
    const html = await req(url);
    const $ = kitty.load(html);

    const title = $('h1').text().trim();
    const cover = $('.module-info-poster img').attr('data-original') ?? '';
    const desc = $('.module-info-introduction-content p').text().trim();
    const remark = $('.module-info-tag-link').eq(0).text().trim();

    const baseUrl = env.baseUrl;
    const playlists: IPlaylist[] = [];

    const tabItems = $('.module-tab-item.tab-item');
    const playContents = $('.module-play-list-content');

    if (tabItems.length > 0 && tabItems.length === playContents.length) {
      tabItems.each((i, el) => {
        let lineTitle = $(el).text().trim();
        if (!lineTitle || lineTitle === '默认') {
          lineTitle = `线路${i + 1}`;
        }

        const videos: IPlaylistVideo[] = [];
        playContents.eq(i).find('a.module-play-list-link').each((_, a) => {
          const $a = $(a);
          const text = $a.find('span').text().trim();
          let href = $a.attr('href') ?? '';
          if (href.startsWith('/')) {
            href = `${baseUrl}${href}`;
          }
          videos.push({ text, id: href });
        });

        if (videos.length > 0) {
          playlists.push({ title: lineTitle, videos });
        }
      });
    } else {
      // fallback：无线路标签时直接遍历所有播放块
      playContents.each((i, el) => {
        const lineTitle = `线路${i + 1}`;
        const videos: IPlaylistVideo[] = [];

        $(el).find('a.module-play-list-link').each((_, a) => {
          const $a = $(a);
          const text = $a.find('span').text().trim();
          let href = $a.attr('href') ?? '';
          if (href.startsWith('/')) {
            href = `${baseUrl}${href}`;
          }
          videos.push({ text, id: href });
        });

        if (videos.length > 0) {
          playlists.push({ title: lineTitle, videos });
        }
      });
    }

    return {
      id,
      title,
      cover,
      desc,
      remark,
      playlist: playlists,
    };
  }

  async getSearch() {
    const keyword = env.get('keyword');
    const page = env.get('page');
    const url = `${env.baseUrl}/vod/search/page/${page}--.html?wd=${keyword}`;
    const html = await req(url);
    const $ = kitty.load(html);

    return $('.module-poster-item').toArray().map(item => {
      const img = $(item).find('img.lazy');
      const id = $(item).attr('href') ?? '';
      const title = img.attr('alt') ?? '';
      let cover = img.attr('data-original') ?? '';
      if (cover.startsWith('//')) cover = 'https:' + cover;
      const remark = $(item).find('.module-item-note').text() ?? '';
      return { id, title, cover, desc: '', remark, playlist: [] };
    });
  }

  async parseIframe() {
    return kitty.utils.getM3u8WithIframe(env);
  }
}
