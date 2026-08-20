// Shared contract between /search and /library for the deep-link a search
// result uses to open a specific video or recording. Kept in one place so
// the tab-value mapping and param names can't silently drift apart between
// the two files that need to agree on them (SearchClient builds the link,
// LibraryClient reads it).

export type Tab = 'animals' | 'live'

export function tabForKind(kind: 'video' | 'recording'): Tab {
  return kind === 'recording' ? 'live' : 'animals'
}

export function buildLibraryHref(item: { kind: 'video' | 'recording'; id: string }): string {
  return `/library?tab=${tabForKind(item.kind)}&video=${item.id}`
}
