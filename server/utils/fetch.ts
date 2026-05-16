import { Buffer } from "node:buffer"
import { $fetch } from "ofetch"

export const myFetch = $fetch.create({
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  },
  timeout: 10000,
  retry: 3,
})

/**
 * Fetch XML/text content using native Node.js https module.
 * This bypasses WAFs that do TLS fingerprint (JA3) blocking.
 * Falls back to globalThis.fetch when https module is unavailable (e.g. Cloudflare Workers).
 */
export async function fetchAsText(url: string, headers: Record<string, string> = {}): Promise<string> {
  try {
    const mod = await import("node:https")
    return new Promise<string>((resolve, reject) => {
      const parsedUrl = new URL(url)
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: "GET",
        headers,
        rejectUnauthorized: true,
      }
      const req = mod.get(options, (res: any) => {
        if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
          reject(new Error(`RSS fetch failed: ${res.statusCode}`))
          return
        }
        const chunks: Buffer[] = []
        res.on("data", (chunk: Buffer) => chunks.push(chunk))
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")))
      })
      req.on("error", reject)
      req.end()
    })
  } catch {
    // Fallback to globalThis.fetch (e.g. Cloudflare Workers)
    const res = await globalThis.fetch(url, { headers })
    if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`)
    return res.text()
  }
}
