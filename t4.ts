import { writeFileSync } from 'fs'

// 从 TG 群里抄过来的
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