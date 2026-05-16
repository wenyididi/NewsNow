import { sources } from "./sources"
import { typeSafeObjectEntries, typeSafeObjectFromEntries } from "./type.util"
import type { ColumnID, HiddenColumnID, Metadata, SourceID } from "./types"

export const columns = {
  china: {
    zh: "国内",
  },
  world: {
    zh: "国际",
  },
  tech: {
    zh: "科技",
  },
  finance: {
    zh: "财经",
  },
  focus: {
    zh: "关注",
  },
  realtime: {
    zh: "实时",
  },
  hottest: {
    zh: "最热",
  },
} as const

export const fixedColumnIds = ["focus", "hottest"] as const satisfies Partial<ColumnID>[]
export const hiddenColumns = Object.keys(columns).filter(id => !fixedColumnIds.includes(id as any)) as HiddenColumnID[]

const hottestOrder: SourceID[] = [
  // 新闻类
  "weibo",
  "toutiao",
  "thepaper",
  "ifeng",
  "tencent-hot",
  "zaobao",
  "36kr-quick",
  "baidu",
  "wallstreetcn-hot",
  "36kr-renqi",
  "cls-hot",
  "zhihu",
  "douyin",
  "kuaishou",
  // 实时快讯
  "wallstreetcn-quick",
  "cls-telegraph",
  "gelonghui",
  "jin10",
  "ithome",
  "pcbeta-windows11",
  // 编码技术类
  "github-trending-today",
  "hackernews",
  "juejin",
  "coolapk",
  "sspai",
  "freebuf",
  // 论坛话题讨论类
  "hupu",
  "tieba",
  "chongbuluo-hot",
  "douban",
  // Steam
  "steam",
  // 视频网站类
  "bilibili-hot-search",
  "bilibili-hot-video",
  "bilibili-ranking",
  "qqvideo-tv-hotsearch",
  "iqiyi-hot-ranklist",
  // 财经
  "xueqiu-hotstock",
]

function sortHottestSources(ids: SourceID[]): SourceID[] {
  const order = new Map(hottestOrder.map((id, i) => [id, i]))
  return ids.sort((a, b) => (order.get(a) ?? 999) - (order.get(b) ?? 999))
}

export const metadata: Metadata = typeSafeObjectFromEntries(typeSafeObjectEntries(columns).map(([k, v]) => {
  switch (k) {
    case "focus":
      return [k, {
        name: v.zh,
        sources: [] as SourceID[],
      }]
    case "hottest":
      return [k, {
        name: v.zh,
        sources: sortHottestSources(typeSafeObjectEntries(sources).filter(([, s]) => (s.type === "hottest" || s.type === "realtime") && !s.redirect).map(([k]) => k as SourceID)),
      }]
    case "realtime":
      return [k, {
        name: v.zh,
        sources: typeSafeObjectEntries(sources).filter(([, v]) => v.type === "realtime" && !v.redirect).map(([k]) => k),
      }]
    default:
      return [k, {
        name: v.zh,
        sources: typeSafeObjectEntries(sources).filter(([, v]) => v.column === k && !v.redirect).map(([k]) => k),
      }]
  }
}))
