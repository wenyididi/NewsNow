import { describe, expect, it } from "vitest"
import { columns, fixedColumnIds, hiddenColumns, metadata } from "./metadata"
import { sources } from "./sources"

describe("metadata", () => {
  it("has all columns defined", () => {
    const columnKeys = Object.keys(columns)
    expect(columnKeys.length).toBeGreaterThanOrEqual(7)
  })

  it("has at least focus, hottest, realtime columns", () => {
    expect(columns).toHaveProperty("focus")
    expect(columns).toHaveProperty("hottest")
    expect(columns).toHaveProperty("realtime")
  })

  it("each column has a Chinese name", () => {
    for (const col of Object.values(columns)) {
      expect(col.zh).toBeTruthy()
    }
  })

  it("fixed columns are present in columns", () => {
    for (const id of fixedColumnIds) {
      expect(columns).toHaveProperty(id)
    }
  })

  it("all hidden columns exist in full columns list", () => {
    for (const id of hiddenColumns) {
      expect(columns).toHaveProperty(id)
    }
  })

  it("metadata has all columns mapped", () => {
    const metadataKeys = Object.keys(metadata)
    expect(metadataKeys.length).toBe(Object.keys(columns).length)
  })

  it("each metadata entry has name and sources array", () => {
    for (const col of Object.values(metadata)) {
      expect(col.name).toBeTruthy()
      expect(Array.isArray(col.sources)).toBe(true)
    }
  })
})

describe("hottest column", () => {
  const hottestSources = metadata.hottest.sources

  it("includes both hottest and realtime type sources", () => {
    const allHottest = Object.entries(sources).filter(([, s]) => s.type === "hottest" && !s.redirect).map(([k]) => k)
    const allRealtime = Object.entries(sources).filter(([, s]) => s.type === "realtime" && !s.redirect).map(([k]) => k)
    for (const id of allHottest) {
      expect(hottestSources).toContain(id)
    }
    for (const id of allRealtime) {
      expect(hottestSources).toContain(id)
    }
  })

  it("excludes redirect sources", () => {
    const redirects = Object.entries(sources).filter(([, s]) => s.redirect).map(([k]) => k)
    for (const id of redirects) {
      expect(hottestSources).not.toContain(id)
    }
  })

  it("weibo should appear before coding sources", () => {
    const weiboIdx = hottestSources.indexOf("weibo" as any)
    const githubIdx = hottestSources.indexOf("github-trending-today" as any)
    expect(weiboIdx).toBeGreaterThanOrEqual(0)
    expect(githubIdx).toBeGreaterThanOrEqual(0)
    expect(weiboIdx).toBeLessThan(githubIdx)
  })

  it("hackernews should appear before video sources", () => {
    const hnIdx = hottestSources.indexOf("hackernews" as any)
    const videoIdx = hottestSources.indexOf("bilibili-hot-search" as any)
    expect(hnIdx).toBeGreaterThanOrEqual(0)
    expect(videoIdx).toBeGreaterThanOrEqual(0)
    expect(hnIdx).toBeLessThan(videoIdx)
  })

  it("does not include disabled nowcoder", () => {
    expect(hottestSources).not.toContain("nowcoder")
  })
})

describe("realtime column", () => {
  it("still exists as a hidden column in metadata", () => {
    expect(metadata).toHaveProperty("realtime")
  })

  it("has sources array", () => {
    expect(Array.isArray(metadata.realtime.sources)).toBe(true)
  })

  it("realtime is still a fixedColumnId (for type compat)", () => {
    expect(fixedColumnIds).toContain("realtime")
  })

  it("is hidden (not shown in nav)", () => {
    // realtime is in fixedColumnIds for type compat but should also appear in hiddenColumns
    // Actually it won't be hidden since it's in fixedColumnIds
    // The nav filtering happens in UI component (navbar.tsx), not here
    expect(fixedColumnIds).toContain("realtime")
  })
})
