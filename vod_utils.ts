import { load } from "cheerio"
import { req } from "utils"

function isXML(text: string): boolean {
  return text.startsWith("<?xml")
}

function isJSON(text: string): boolean {
  return text.startsWith("{") && text.endsWith("}")
}

async function getCategory(cfg: Iconfig): Promise<ICategory[]> {
  const { api } = cfg
  const text = await req(api)
  if (isXML(text)) {
    const $ = load(text, { xmlMode: true })
    return $("class ty").toArray().map<ICategory>(item => {
      return {
        text: $(item).text().trim(),
        id: $(item).attr("id") ?? "",
      }
    })
  } else if (isJSON(text)) {
    const obj: {
      class: Array<{
        type_id: number
        type_name: string
      }>
    } = JSON.parse(text)
    return obj.class.map(item => {
      return {
        text: item.type_name,
        id: item.type_id.toString(),
      }
    })
  }
  return []
}

async function getVideosCountWithCategory(cfg: Iconfig, cate: ICategory): Promise<number> {
  const { api } = cfg
  const { id } = cate
  const text = await req(api, {
    params: {
      ac: "videolist",
      pg: 1,
      t: id,
    }
  })
  if (isXML(text)) {
    const $ = load(text, { xmlMode: true })
    return +($("list").attr("pagecount") ?? 0)
  } else if (isJSON(text)) {
    try {
      const obj: { pagecount: number } = JSON.parse(text)
      return +(obj.pagecount ?? 0)
    } catch (error) {
      return 0
    }
  }
  return 0
}

export async function getAvailableCategoryWithCfg(cfg: Iconfig) {
  console.debug(`[info] start task with ${cfg.name}`)
  const cates = await getCategory(cfg)
  console.debug(`[info] get ${cates.length} categories`)
  const result: ICategory[] = []
  for (const cate of cates) {
    console.debug(`[info] check category ${cate.text}`)
    const count = await getVideosCountWithCategory(cfg, cate)
    console.debug(`[info] ${cate.text} has ${count} videos`)
    if (count >= 20) {
      result.push(cate)
    }
  }
  return result
}