// Unit tests for utility functions

function formatDuration(seconds: number | null): string | null {
  if (!seconds) return null
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return match?.[1] ?? null
}

describe('formatDuration', () => {
  it('returns null for null input', () => {
    expect(formatDuration(null)).toBeNull()
  })
  it('returns null for 0 seconds', () => {
    expect(formatDuration(0)).toBeNull()
  })
  it('formats seconds correctly', () => {
    expect(formatDuration(90)).toBe('1:30')
  })
  it('formats over 1 hour correctly', () => {
    expect(formatDuration(3661)).toBe('1:01:01')
  })
  it('26 minutes 49 seconds', () => {
    expect(formatDuration(1609)).toBe('26:49')
  })
  it('37 minutes 7 seconds', () => {
    expect(formatDuration(2227)).toBe('37:07')
  })
})

describe('getVimeoId', () => {
  it('extracts ID from standard Vimeo URL', () => {
    expect(getVimeoId('https://vimeo.com/1194441479')).toBe('1194441479')
  })
  it('handles video/ path in URL', () => {
    expect(getVimeoId('https://vimeo.com/video/1194441479')).toBe('1194441479')
  })
  it('returns null for invalid URL', () => {
    expect(getVimeoId('https://youtube.com/watch?v=abc')).toBeNull()
  })
})
