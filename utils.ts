import { writeFileSync } from 'fs'
import { load } from 'cheerio'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function req(
  urlOrOptions: string | KittyRequestOptions,
  options?: Partial<KittyRequestOptions>
): Promise<string> {
  let finalOptions: KittyRequestOptions

  if (typeof urlOrOptions === 'string') {
    // req(url) | req(url, options)
    finalOptions = {
      url: urlOrOptions,
      method: 'GET',
      headers: {},
      params: {},
      ...options
    }
  } else {
    // req(options)
    finalOptions = {
      method: 'GET',
      headers: {},
      params: {},
      ...urlOrOptions
    }
  }

  if (!finalOptions.url) {
    throw new Error('URL is required')
  }

  let url = finalOptions.url
  let body: string | undefined

  if (!finalOptions.headers) {
    finalOptions.headers = {}
  }

  if (finalOptions.params && Object.keys(finalOptions.params).length > 0) {
    if (finalOptions.method === 'GET') {
      const urlObj = new URL(url)
      Object.entries(finalOptions.params).forEach(([key, value]) => {
        urlObj.searchParams.set(key, String(value))
      })
      url = urlObj.toString()
    } else {
      if (!finalOptions.headers['Content-Type']) {
        finalOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded'
      }

      if (finalOptions.headers['Content-Type'] === 'application/json') {
        body = JSON.stringify(finalOptions.params)
      } else {
        body = new URLSearchParams(finalOptions.params as Record<string, string>).toString()
      }
    }
  }

  const response = await fetch(url, {
    method: finalOptions.method,
    headers: finalOptions.headers,
    body: body
  })

  return await response.text()
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