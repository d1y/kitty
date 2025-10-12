import { writeFileSync } from 'fs'
import { join } from 'path'
import { getAvailableCategoryWithCfg } from "./vod_utils"
import { req } from "utils"

const vods = <Iconfig[]>[
  {
    id: "niuniuziyuan",
    name: "牛牛视频",
    api: "https://api.niuniuzy.me/api.php/provide/vod",
    nsfw: false,
    logo: "https://api.niuniuzy.me/template/niuniuzy/static/images/logo.png",
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "feifanziyuan",
    name: "非凡资源",
    api: "http://cj.ffzyapi.com/api.php/provide/vod/at/xml",
    logo: "http://cj.ffzyapi.com/template/ffzy/static/picture/logo.png",
    nsfw: false,
    type: 0,
    extra: {
      gfw: false,
    },
  },
];

// from args context
const args = process.argv.slice(2)
const vodFile = args[0]
const file1 = join(process.cwd(), vodFile)

writeFileSync(file1, JSON.stringify(vods, null, 2))