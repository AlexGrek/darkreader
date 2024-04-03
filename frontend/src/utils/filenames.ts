export function toChapterName(s: string) {
    return s.replace(/_/g, " ").replace(".txt", "")
}