import { XMLParser } from "fast-xml-parser"
import type { NewsItem } from "@shared/types"
import { load } from "cheerio"

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
  "Referer": "https://www.36kr.com/",
}

const quick = defineSource(async () => {
  const baseURL = "https://www.36kr.com"
  const url = `${baseURL}/newsflashes`
  const response = await myFetch(url, { headers: BROWSER_HEADERS }) as any
  const $ = load(response)
  const news: NewsItem[] = []

  // Primary: .newsflash-item
  let $items = $(".newsflash-item")
  // Fallback: look for items containing links to newsflashes
  if (!$items.length) {
    $items = $("a[href*='/newsflashes/']").parent()
  }
  // Fallback: look for any structured list in the main area
  if (!$items.length) {
    $items = $(".main, .layout-main, .container, [class*='newsflash'], [class*='news-flash']").children().filter("div, li, article")
  }

  $items.each((_, el) => {
    const $el = $(el)
    const $a = $el.find("a[href*='/newsflashes/']").first().length
      ? $el.find("a[href*='/newsflashes/']").first()
      : $el.find("a").first()
    const url = $a.attr("href")
    const title = $a.text().trim()
    const relativeDate = $el.find(".time").first().text().trim()
      || $el.find("time").attr("datetime")
      || $el.find("[class*='time']").first().text().trim()
    if (url && title) {
      const href = url.startsWith("http") ? url : `${baseURL}${url}`
      if (!news.some(n => n.url === href)) {
        news.push({
          url: href,
          title,
          id: url,
          extra: {
            date: relativeDate ? parseRelativeDate(relativeDate, "Asia/Shanghai").valueOf() : Date.now(),
          },
        })
      }
    }
  })

  return news
})

const renqi = defineSource(async () => {
  const response = await myFetch<string>("https://36kr.com/feed", {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      "Accept": "text/xml, application/rss+xml, application/xml;q=0.9, */*;q=0.8",
    },
    responseType: "text",
  })

  const parser = new XMLParser({
    textNodeName: "$text",
    ignoreAttributes: false,
  })

  const result: any = parser.parse(response as string)
  const channel = result?.rss?.channel
  if (!channel) throw new Error("Invalid RSS feed")

  let items = channel.item
  if (!items) return []
  if (!Array.isArray(items)) items = [items]

  return items
    .filter((item: any) => item && item.title)
    .map((item: any) => ({
      title: typeof item.title === "string" ? item.title : item.title?.$text || "",
      url:
        typeof item.link === "string"
          ? item.link
          : item.link?.href || "https://36kr.com",
      id:
        typeof item.link === "string"
          ? item.link
          : item.link?.href || "https://36kr.com",
      extra: {
        info: "36氪",
        hover:
          typeof item.description === "string"
            ? item.description.replace(/<[^>]*>/g, "").slice(0, 200)
            : undefined,
      },
    }))
})

export default defineSource({
  "36kr": quick,
  "36kr-quick": quick,
  "36kr-renqi": renqi,
})
