import { writeFileSync } from "fs"
interface ILIve {
  repo?: string
  path?: string
  branch?: string
  name: string
  url?: string
  type: 0 | 1
}

const data = <ILIve[]>[
  { name: "vbskycn/tv", repo: "vbskycn/iptv", path: "tv/iptv4.m3u", branch: "master", type: 0 },
  { name: "kimwang1978/tv", repo: "kimwang1978/collect-tv-txt", path: "bbxx_lite.m3u", branch: "main", type: 0 },
  { name: "Guovin/tv", repo: "Guovin/iptv-api", path: "output/ipv4/result.m3u", branch: "gd", type: 0 },
  { name: "mytv-android/tv", repo: "mytv-android/China-TV-Live-M3U8", path: "iptv.m3u", branch: "main", type: 0 },
]

const realData = data.map(item => {
  return {
    ...item,
    url: item.url || `https://raw.githubusercontent.com/${item.repo}/${item.branch || 'main'}/${item.path}`
  }
})

const pipe = {
  lives: realData.map<ILiveItem>(item => {
    return {
      name: item.name,
      url: item.url,
      type: item.type,
    }
  })
}

const outputFile = process.argv[2] || 'output.json'
writeFileSync(outputFile, JSON.stringify(pipe, null, 2))