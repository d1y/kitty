import { writeFileSync } from 'fs'
import { load } from 'cheerio'

/** @type {KittyReq} */
export async function req(url: string) {
  return await (await fetch(url)).text()
}

export const kitty: Kitty = { load }

type safeSet = (key: KittyEnvParams, value: any) => void

export function toEnv(env: { baseUrl: string, params?: Partial<Record<KittyEnvParams, any>> }) {
  return <KittyEnv & { set: safeSet }>{
    baseUrl: env.baseUrl ?? "",
    params: env.params ?? {},
    get(key, defaultValue) {
      return this.params[key] ?? defaultValue
    },
    set(key, value) {
      this.params[key] = value
    }
  }
}

export function createTestEnv(baseUrl: string, params: Partial<Record<KittyEnvParams, any>> = {}) {
  return toEnv({ baseUrl, params })
}

export function write(code: string, file: string) {
  writeFileSync(file, code, { encoding: 'utf-8' })
}