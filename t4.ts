import { writeFileSync } from 'fs'

// 从 TG 群和 @CxiaoyuN 那里抄过来的
// 目的是为了测试 t4 的效果
// 不是 @d1y 本人的 drpy-node 实例, 所以不要来骚扰我(@d1y)
const t4 = [
  {
    "id": "py_DianYingTanTang",
    "name": "🫐电影天堂(T4)",
    "api": "https://py.doube.eu.org/spider?site=DianYingTanTang",
    "nsfw": false,
  },
  {
    "id": "py_OleVod",
    "name": "🍉欧乐影院(T4)",
    "api": "https://py.doube.eu.org/spider?site=OleVod",
    "nsfw": false,
  },
  {
    "id": "py_Dm84",
    "name": "🍋动漫巴士(T4)",
    "api": "https://py.doube.eu.org/spider?site=Dm84",
    "nsfw": false,
  },
  {
    "id": "py_BadNews",
    "name": "🔞BadNews(T4)",
    "api": "https://py.doube.eu.org/spider?site=BadNews",
    "nsfw": true,
  },
  {
    "id": "py_Miss",
    "name": "🔞MissAV(T4)",
    "api": "https://py.doube.eu.org/spider?site=Miss",
    "nsfw": true,
  },
  {
    "id": "py_AiDou",
    "name": "🔞AiDou(T4)",
    "api": "https://py.doube.eu.org/spider?site=AiDou",
    "nsfw": true,
  },
  {
    "id": "py_MrJav",
    "name": "🔞MRJav(T4)",
    "api": "https://py.doube.eu.org/spider?site=MrJav",
    "nsfw": true,
  },
  {
    "id": "py_madou",
    "name": "🔞麻豆(T4)",
    "api": "https://py.doube.eu.org/spider?site=MaDou",
    "nsfw": true,
  },
  {
    "id": "t4-AiGuaTV",
    "name": "爱瓜TV(T4)",
    "api": "https://tvbot.ggff.net/aigua",
    "nsfw": true,
  },
  {
    "id": "t4-guazi",
    "name": "瓜子影视(T4)",
    "api": "https://tvbot.ggff.net/guazi",
    "nsfw": false,
  },
  {
    "id": "t4-jubaba",
    "name": "嗷呜影院(T4)",
    "api": "https://tvbot.ggff.net/jubaba",
    "nsfw": false,
  },
  {
    "id": "t4-klhj",
    "name": "老张合集(T4)",
    "api": "https://zhangqun66.com/klhj.php",
    "nsfw": false,
  },
  {
    "id": "t4-lzys",
    "name": "老张影视(T4)",
    "api": "http://zhangqun1818.serv00.net/zh/2242.php",
    "nsfw": false,
  },
  {
    "id": "t4-madou",
    "name": "MaDou(T4)",
    "api": "https://py.doube.eu.org/spider?site=MaDou",
    "nsfw": true,
  },
  {
    "id": "t4-misstv",
    "name": "MissTV(T4)",
    "api": "https://py.doube.eu.org/spider?site=Miss",
    "nsfw": true,
  },
  {
    "id": "t4-mrjav",
    "name": "MrJav(T4)",
    "api": "https://py.doube.eu.org/spider?site=MrJav",
    "nsfw": true,
  },
  {
    "id": "t4-uvod",
    "name": "优视频(T4)",
    "api": "https://tvbot.ggff.net/uvod",
    "nsfw": false,
  },
  {
    "id": "t4-yongle",
    "name": "永乐影视(T4)",
    "api": "https://tvbot.ggff.net/yongle",
    "nsfw": false,
  }
].map(item => {
  const { id, name, api, nsfw } = item
  return <Iconfig>{
    id,
    name,
    api,
    nsfw,
    type: 1,
    extra: {
      template: "t4",
    }
  }
})

const file = process.argv[2]
writeFileSync(file, JSON.stringify(t4, null, 2))