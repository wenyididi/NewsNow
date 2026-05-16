import { useEffect, useMemo } from "react"
import { useMedia } from "react-use"

export declare type ColorScheme = "dark" | "light" | "auto"

const colorSchemeAtom = atomWithStorage("color-scheme", "dark")
export function useDark() {
  const [colorScheme, setColorScheme] = useAtom(colorSchemeAtom)
  const prefersDarkMode = useMedia("(prefers-color-scheme: dark)")
  const isDark = useMemo(() => colorScheme === "auto" ? prefersDarkMode : colorScheme === "dark", [colorScheme, prefersDarkMode])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
    const meta = document.querySelector("meta[name='theme-color']")
    if (meta) {
      meta.setAttribute("content", isDark ? "#11131e" : "#f5f5f5")
    }
  }, [isDark])

  const setDark = (value: ColorScheme) => {
    setColorScheme(value)
  }

  const toggleDark = () => {
    setColorScheme(isDark ? "light" : "dark")
  }

  return { isDark, setDark, toggleDark }
}
