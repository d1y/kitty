import { writeFileSync } from 'fs'
import { join } from 'path'

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
    id: "zuidaziyuan",
    name: "最大资源",
    api: "http://zuidazy.me/api.php/provide/vod",
    nsfw: false,
    logo: "http://zuidazy.me/template/ziyuan2/images/logo.png",
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "yayaziyuan",
    name: "丫丫资源",
    api: "https://cj.yayazy.net/api.php/provide/vod",
    nsfw: false,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "maotaiziyuan",
    name: "茅台资源",
    api: "https://caiji.maotaizy.cc/api.php/provide/vod/at/josn",
    logo: "https://caiji.maotaizy.cc/template/default/images/logo.png",
    nsfw: false,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "yinghuaziyuan",
    name: "樱花资源",
    api: "http://m3u8.apiyhzy.com/api.php/provide/vod",
    nsfw: false,
    type: 0,
    extra: {
      gfw: true,
    },
  },
  {
    id: "jinyingziyuan",
    name: "金鹰资源",
    api: "https://jyzyapi.com/provide/vod/from/jinyingm3u8",
    logo: "https://jyzyapi.com/template/jinying/images/logo.png",
    nsfw: false,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "wangwangduanju",
    name: "旺旺短剧",
    api: "https://wwzy.tv/api.php/provide/vod",
    nsfw: false,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "360ziyuan",
    name: "360资源",
    api: "https://360zy.com/api.php/provide/vod",
    logo: "https://360zy.com/logo.png",
    nsfw: false,
    type: 0,
    extra: {
      gfw: true,
    },
  },
  {
    id: "tianyiziyuan",
    name: "天翼资源",
    api: "https://www.911ysw.top/tianyi.php/provide/vod",
    logo: "https://www.911ysw.top/static/jsui/img/logo_max_f.png",
    nsfw: false,
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
  {
    id: "aiqiyiziyuan",
    name: "爱奇艺资源",
    api: "https://iqiyizyapi.com/api.php/provide/vod",
    nsfw: false,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "piaolingyingyuan",
    name: "飘零影院",
    api: "https://p2100.net/api.php/provide/vod",
    nsfw: false,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "jisuziyuan",
    name: "极速资源",
    api: "https://jszyapi.com/api.php/provide/vod/at/json",
    logo: "https://jszyapi.com/template/default/images/site_logo.png",
    nsfw: false,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "1080zyku",
    name: "1080资源",
    api: "http://api.1080zyku.com/inc/api.php/provide/vod",
    nsfw: false,
    type: 0,
    extra: {
      gfw: true,
    },
  },
  {
    id: "liangziziyuan",
    name: "量子资源",
    api: "http://cj.lziapi.com/api.php/provide/vod/from/lzm3u8",
    nsfw: false,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "baofengziyuan",
    name: "暴风资源",
    api: "https://bfzyapi.com/api.php/provide/vod",
    nsfw: false,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "wolongziyuan",
    name: "卧龙资源",
    api: "http://collect.wolongzyw.com/api.php/provide/vod",
    nsfw: false,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "dianyingtiantang",
    name: "电影天堂",
    api: "http://caiji.dyttzyapi.com/api.php/provide/vod/at/xml",
    nsfw: false,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "tianyayingshiziyuan",
    name: "天涯影视",
    api: "https://tyyszyapi.com/api.php/provide/vod",
    logo: "https://tyyszyapi.com/static/jsui/img/logo_max_f.png",
    nsfw: false,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "guangsuziyuan",
    name: "光速资源",
    api: "https://api.guangsuapi.com/api.php/provide/vod/from/gsm3u8",
    logo: "https://api.guangsuapi.com/template/guangsu/image/logo.png",
    nsfw: false,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "baiduziyuan",
    name: "百度资源",
    api: "http://api.apibdzy.com/api.php/provide/vod",
    logo: "http://api.apibdzy.com/template/stui_tpl/statics/img/logo_max_f.png",
    nsfw: false,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "modouziyuan",
    name: "魔都资源",
    api: "https://www.mdzyapi.com/api.php/provide/vod",
    nsfw: false,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "doubanziyuan",
    name: "豆瓣资源",
    api: "https://caiji.dbzy5.com/api.php/provide/vod/at/josn",
    logo: "https://caiji.dbzy5.com/template/vipzy/images/logo.png",
    nsfw: false,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "maoyanziyuan",
    name: "猫眼资源",
    api: "https://api.maoyanapi.top/api.php/provide/vod",
    nsfw: false,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "shandianziyuan",
    name: "闪电资源",
    api: "http://sdzyapi.com/api.php/provide/vod/from/sdm3u8",
    nsfw: false,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "hongniuziyuan",
    name: "红牛资源",
    api: "http://hongniuzy2.com/api.php/provide/vod/from/hnm3u8",
    nsfw: false,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "suboziyuan",
    name: "速播资源",
    api: "https://subocj.com/api.php/provide/vod/at/json",
    logo: "https://subocj.com/statics/img/logo_max_f.png",
    nsfw: false,
    type: 0,
    extra: {
      gfw: false,
    },
  },
];

const nsfwVods = [
  {
    id: "Xxibaoziyuan",
    name: "X细胞资源",
    api: "https://www.xxibaozyw.com/api.php/provide/vod",
    nsfw: true,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "91shipin",
    name: "91视频",
    api: "https://91av.cyou/api.php/provide/vod/",
    nsfw: true,
    type: 0,
    extra: {
      gfw: true,
    },
  },
  {
    id: "xiaojiziyuan",
    name: "小鸡资源",
    api: "https://api.xiaojizy.live/provide/vod/",
    nsfw: true,
    type: 0,
    extra: {
      gfw: true,
    },
  },
  {
    id: "danaiziziyuan",
    name: "大奶子资源",
    api: "https://apidanaizi.com/api.php/provide/vod",
    nsfw: true,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "didiziyuan",
    name: "滴滴资源",
    api: "https://api.ddapi.cc/api.php/provide/vod/",
    nsfw: true,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "jikunziyuan",
    name: "鸡坤资源",
    api: "https://jkunzyapi.com/api.php/provide/vod/",
    nsfw: true,
    type: 0,
    extra: {
      gfw: true,
    },
  },
  {
    id: "yinshuiji",
    name: "淫水机",
    api: "https://www.xrbsp.com/api/json.php",
    nsfw: true,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "xiangnaier",
    name: "香奶儿",
    api: "https://www.gdlsp.com/api/json.php",
    nsfw: true,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "jingpinziyuan",
    name: "精品资源",
    api: "https://www.jingpinx.com/api.php/provide/vod/",
    nsfw: true,
    type: 0,
    extra: {
      gfw: true,
    },
  },
  {
    id: "laosebiziyuan",
    name: "老色逼资源",
    api: "https://apilsbzy1.com/api.php/provide/vod/",
    nsfw: true,
    type: 0,
    extra: {
      gfw: true,
    },
  },
  {
    id: "fanhaoziyuan",
    name: "番号资源",
    api: "http://fhapi9.com/api.php/provide/vod/",
    nsfw: true,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "huangsecangkuziyuan",
    name: "黄色仓库资源",
    api: "https://hsckzy888.com/api.php/provide/vod/at/xml/",
    nsfw: true,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "baihuaziyuan",
    name: "百花资源",
    api: "https://bhziyuan.com/api.php/provide/vod/at/xml",
    nsfw: true,
    type: 0,
    extra: {
      gfw: true,
    },
  },
  {
    id: "youyiziyuan",
    name: "优异资源",
    api: "https://a.uezy.pw/api.php/provide/vod/",
    nsfw: true,
    type: 0,
    extra: {
      gfw: true,
    },
  },
  {
    id: "lajiaoziyuan",
    name: "辣椒资源",
    api: "https://apilj.com/api.php/provide/vod/",
    nsfw: true,
    type: 0,
    extra: {
      gfw: true,
    },
  },
  {
    id: "️baipiao",
    name: "️白嫖",
    api: "https://www.kxgav.com/api/json.php",
    nsfw: true,
    type: 0,
    extra: {
      gfw: true,
    },
  },
  {
    id: "meishaonvziyuan",
    name: "美少女资源",
    api: "https://www.msnii.com/api/xml.php",
    nsfw: true,
    type: 0,
    extra: {
      gfw: true,
    },
  },
  {
    id: "115ziyuan",
    name: "115资源",
    api: "https://155api.com/api.php/provide/vod/",
    nsfw: true,
    type: 0,
    extra: {
      gfw: true,
    },
  },
  {
    id: "xingbaziyuan",
    name: "杏吧资源",
    api: "https://xingba222.com/api.php/provide/vod/at/xml",
    nsfw: true,
    type: 0,
    extra: {
      gfw: true,
    },
  },
  {
    id: "dadiziyuan",
    name: "大地资源",
    api: "https://dadiapi.com/api.php",
    nsfw: true,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "yutuziyuan",
    name: "玉兔资源",
    api: "https://apiyutu.com/api.php/provide/vod/",
    nsfw: true,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "AIvin",
    name: "AIvin",
    api: "http://lbapiby.com/api.php/provide/vod/at/json",
    nsfw: true,
    type: 0,
    extra: {
      gfw: true,
    },
  },
  {
    id: "shileyuan",
    name: "湿乐园",
    api: "https://xxavs.com/api.php/provide/vod/",
    nsfw: true,
    type: 0,
    extra: {
      gfw: true,
    },
  },
  {
    id: "️lebo",
    name: "️乐播",
    api: "https://lbapi9.com/api.php/provide/vod/",
    nsfw: true,
    type: 0,
    extra: {
      gfw: true,
    },
  },
  {
    id: "naixiangxiangziyuan",
    name: "奶香香资源",
    api: "https://naixxzy.com/api.php/provide/vod/",
    nsfw: true,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "huangAVziyuan",
    name: "黄AV资源",
    api: "https://www.pgxdy.com/api/xml.php",
    nsfw: true,
    type: 0,
    extra: {
      gfw: true,
    },
  },
  {
    id: "senlinziyuan",
    name: "森林资源",
    api: "http://slapibf.com/api.php/provide/vod",
    nsfw: true,
    type: 0,
    extra: {
      gfw: true,
    },
  },
  {
    id: "senanguoziyuan",
    name: "色南国资源",
    api: "https://api.sexnguon.com/api.php/provide/vod/",
    nsfw: true,
    type: 0,
    extra: {
      gfw: true,
    },
  },
  {
    id: "fanjiaziyuan",
    name: "番茄资源",
    api: "https://fqzy4.me/api.php/provide/vod/at/xml",
    nsfw: true,
    type: 0,
    extra: {
      gfw: true,
    },
  },
  {
    id: "souavziyuan",
    name: "souav",
    api: "https://api.souavzy.vip/api.php/provide/vod",
    nsfw: true,
    type: 0,
    extra: {
      gfw: true,
    },
  },
  {
    id: "huangguaziyuan",
    name: "黄瓜资源",
    api: "https://www.avre06.com/api.php/provide/vod",
    nsfw: true,
    type: 0,
    extra: {
      gfw: true,
    },
  },
  {
    id: "shayuziyuan",
    name: "鲨鱼资源",
    api: "https://shayuapi.com/api.php/provide/vod",
    nsfw: true,
    type: 0,
    extra: {
      gfw: true,
    },
  },
  {
    id: "91md18+",
    name: "91麻豆",
    api: "http://91md.me/api.php/provide/vod",
    nsfw: true,
    type: 0,
    extra: {
      gfw: true,
    },
  },
  {
    id: "wukongzyz",
    name: "悟空资源",
    api: "https://wukongzyz.com/api.php/provide/vod",
    nsfw: true,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "xzybb1",
    name: "幸资源站",
    api: "https://xzybb1.com/api.php/provide/vod",
    nsfw: true,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "siwazyw.tv",
    name: "丝袜资源",
    api: "https://www.siwazyw.tv/api.php/provide/vod",
    nsfw: true,
    type: 0,
    extra: {
      gfw: false,
    },
  },
  {
    id: "api.bwzyz.com",
    name: "百万资源站",
    api: "https://api.bwzyz.com/api.php/provide/vod/at/json",
    nsfw: true,
    type: 0,
    extra: {
      gfw: false,
    },
  },
]

const args = process.argv.slice(2)

const vodFile = args[0]
const nsfwVodFile = args[1]

const file1 = join(process.cwd(), vodFile)
const file2 = join(process.cwd(), nsfwVodFile)

writeFileSync(file1, JSON.stringify(vods, null, 2))
writeFileSync(file2, JSON.stringify(nsfwVods, null, 2))