import { XMLParser } from "fast-xml-parser"
import { fetchAsText } from "#/utils/fetch"

export default defineSource(async () => {
  const xml = await fetchAsText("https://www.freebuf.com/feed", {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept": "text/xml, application/rss+xml, application/xml;q=0.9, */*;q=0.8",
  })

  const parser = new XMLParser({
    textNodeName: "$text",
    ignoreAttributes: false,
  })

  const result: any = parser.parse(xml)
  const channel = result?.rss?.channel
  if (!channel) throw new Error("Invalid RSS feed")

  let items = channel.item
  if (!items) return []
  if (!Array.isArray(items)) items = [items]

  return items.filter(Boolean).map((item: any) => ({
    title:
      typeof item.title === "string"
        ? item.title
        : item.title?.$text || "",
    url:
      typeof item.link === "string"
        ? item.link
        : item.link?.href || "https://www.freebuf.com",
    id: item.guid?.$text || item.link?.href || item.link || "",
    pubDate: item.pubDate
      ? new Date(item.pubDate).valueOf()
      : undefined,
    extra: {
      hover:
        typeof item.description === "string"
          ? item.description.replace(/<[^>]*>/g, "").slice(0, 200)
          : undefined,
    },
  }))
})
