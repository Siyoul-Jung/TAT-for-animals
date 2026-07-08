// Tests the real video display helpers (src/lib/video.ts) — the previous
// version of this file tested an inline copy, which stayed green even if the
// real code regressed.
import { parseVimeo, formatDuration } from '@/lib/video'

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

describe('parseVimeo', () => {
  it('extracts ID from a public URL', () => {
    expect(parseVimeo('https://vimeo.com/1194441479')).toEqual({ id: '1194441479', hash: null })
  })
  it('handles the video/ path form', () => {
    expect(parseVimeo('https://vimeo.com/video/1194441479')).toEqual({ id: '1194441479', hash: null })
  })
  it('captures the private-link hash in path form (dropping it breaks unlisted playback)', () => {
    expect(parseVimeo('https://vimeo.com/1194441479/abc123def')).toEqual({ id: '1194441479', hash: 'abc123def' })
  })
  it('captures the private-link hash in ?h= query form', () => {
    expect(parseVimeo('https://vimeo.com/1194441479?h=abc123def')).toEqual({ id: '1194441479', hash: 'abc123def' })
  })
  it('returns null for a non-Vimeo URL', () => {
    expect(parseVimeo('https://youtube.com/watch?v=abc')).toBeNull()
  })
})
