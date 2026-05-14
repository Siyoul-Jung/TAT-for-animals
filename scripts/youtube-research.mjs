/**
 * TATLife YouTube Channel Analysis
 * Run: node scripts/youtube-research.mjs
 * Requires: YOUTUBE_API_KEY in .env.local
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local manually (no dotenv dependency needed)
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env.local')
    const lines = readFileSync(envPath, 'utf-8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIndex = trimmed.indexOf('=')
      if (eqIndex === -1) continue
      const key = trimmed.slice(0, eqIndex).trim()
      const value = trimmed.slice(eqIndex + 1).trim()
      process.env[key] = value
    }
  } catch {
    console.error('.env.local 파일을 읽을 수 없습니다.')
    process.exit(1)
  }
}

loadEnv()

const API_KEY = process.env.YOUTUBE_API_KEY
if (!API_KEY) {
  console.error('YOUTUBE_API_KEY가 .env.local에 없습니다.')
  process.exit(1)
}

const BASE = 'https://www.googleapis.com/youtube/v3'

async function get(endpoint, params) {
  const url = new URL(`${BASE}/${endpoint}`)
  url.searchParams.set('key', API_KEY)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }
  const res = await fetch(url.toString())
  if (!res.ok) {
    const err = await res.json()
    throw new Error(`API 오류 [${endpoint}]: ${JSON.stringify(err.error?.message)}`)
  }
  return res.json()
}

// Resolve @handle → channel ID
async function resolveChannelId(handle) {
  const data = await get('channels', {
    part: 'id,snippet,statistics',
    forHandle: handle.replace('@', ''),
  })
  if (!data.items?.length) throw new Error(`채널을 찾을 수 없습니다: ${handle}`)
  return data.items[0]
}

// Get all uploads (up to maxResults via pagination)
async function getUploads(uploadsPlaylistId, maxResults = 200) {
  const videos = []
  let pageToken = undefined

  while (videos.length < maxResults) {
    const params = {
      part: 'snippet',
      playlistId: uploadsPlaylistId,
      maxResults: Math.min(50, maxResults - videos.length),
    }
    if (pageToken) params.pageToken = pageToken

    const data = await get('playlistItems', params)
    for (const item of data.items ?? []) {
      videos.push({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        publishedAt: item.snippet.publishedAt,
        description: item.snippet.description,
      })
    }
    if (!data.nextPageToken) break
    pageToken = data.nextPageToken
  }
  return videos
}

// Fetch view counts in batches of 50
async function enrichWithStats(videos) {
  const enriched = []
  for (let i = 0; i < videos.length; i += 50) {
    const batch = videos.slice(i, i + 50)
    const ids = batch.map((v) => v.id).join(',')
    const data = await get('videos', {
      part: 'statistics,contentDetails',
      id: ids,
    })
    for (const item of data.items ?? []) {
      const orig = batch.find((v) => v.id === item.id)
      if (!orig) continue
      enriched.push({
        ...orig,
        views: parseInt(item.statistics.viewCount ?? '0', 10),
        likes: parseInt(item.statistics.likeCount ?? '0', 10),
        comments: parseInt(item.statistics.commentCount ?? '0', 10),
        duration: item.contentDetails.duration,
      })
    }
  }
  return enriched
}

// Categorize: animal vs human healing vs other
// Title keywords get 3x weight vs description keywords — descriptions often contain
// generic healing/tapas text that drowns out animal-specific title signals.
function categorize(title, description) {
  const titleLow = title.toLowerCase()
  const descLow = description.toLowerCase()
  const animalKeywords = [
    'animal', 'animals', 'dog', 'dogs', 'cat', 'cats', 'horse', 'horses',
    'pet', 'pets', 'puppy', 'puppies', 'kitten', 'kittens', 'bird', 'birds',
    'rescue', 'feral', 'shelter', 'veterinary', 'bowie', 'luna', 'snowball',
    'wildlife', 'rabbit', 'bunny', 'hamster', 'guinea pig', 'parrot',
  ]
  const humanKeywords = [
    'aces', 'trauma', 'anxiety', 'ptsd', 'childhood', 'pain', 'emotion',
    'belief', 'manifest', 'tat tip', 'taste of tat', 'new to tat',
    'people', 'grief', 'loss', 'depress', 'relax', 'sleep', 'fear',
    'money', 'meditation', 'dark times', 'climate', 'disaster',
  ]

  const animalTitleScore = animalKeywords.filter((kw) => titleLow.includes(kw)).length * 3
  const animalDescScore = animalKeywords.filter((kw) => descLow.includes(kw)).length
  const humanTitleScore = humanKeywords.filter((kw) => titleLow.includes(kw)).length * 3
  const humanDescScore = humanKeywords.filter((kw) => descLow.includes(kw)).length

  const animalScore = animalTitleScore + animalDescScore
  const humanScore = humanTitleScore + humanDescScore

  if (animalScore > 0 && animalScore >= humanScore) return 'animal'
  if (humanScore > 0) return 'human'
  return 'other'
}

function formatNum(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function parseDuration(iso) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!m) return '?'
  const h = parseInt(m[1] ?? '0')
  const min = parseInt(m[2] ?? '0')
  const sec = parseInt(m[3] ?? '0')
  if (h > 0) return `${h}시간 ${min}분`
  if (min > 0) return `${min}분 ${sec}초`
  return `${sec}초`
}

// ──────────────────────────────────────────────
//  MAIN
// ──────────────────────────────────────────────

async function main() {
  console.log('\n🔍 TATLife YouTube 채널 분석 중...\n')

  const channel = await resolveChannelId('@TATLifeVideos')
  const stats = channel.statistics
  const uploadsId = channel.snippet?.thumbnails
    ? (await get('channels', {
        part: 'contentDetails',
        id: channel.id,
      })).items[0].contentDetails.relatedPlaylists.uploads
    : null

  // Re-fetch with contentDetails to get uploads playlist
  const channelFull = await get('channels', {
    part: 'contentDetails,statistics,snippet',
    id: channel.id,
  })
  const uploadsPlaylistId = channelFull.items[0].contentDetails.relatedPlaylists.uploads
  const channelStats = channelFull.items[0].statistics
  const channelSnippet = channelFull.items[0].snippet

  console.log('━'.repeat(60))
  console.log('📊 채널 기본 정보')
  console.log('━'.repeat(60))
  console.log(`채널명      : ${channelSnippet.title}`)
  console.log(`구독자 수   : ${formatNum(parseInt(channelStats.subscriberCount ?? '0'))}명`)
  console.log(`총 영상 수  : ${formatNum(parseInt(channelStats.videoCount ?? '0'))}개`)
  console.log(`총 조회수   : ${formatNum(parseInt(channelStats.viewCount ?? '0'))}회`)
  console.log(`채널 개설일 : ${channelSnippet.publishedAt?.slice(0, 10)}`)
  console.log()

  // Fetch all videos (up to 200)
  process.stdout.write('영상 목록 가져오는 중...')
  const rawVideos = await getUploads(uploadsPlaylistId, 400)
  process.stdout.write(` ${rawVideos.length}개 확인\n`)

  process.stdout.write('조회수/좋아요 데이터 가져오는 중...')
  const videos = await enrichWithStats(rawVideos)
  process.stdout.write(' 완료\n\n')

  // Sort by views
  const byViews = [...videos].sort((a, b) => b.views - a.views)
  // Sort by date (newest first)
  const byDate = [...videos].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))

  // Categorize
  const categorized = videos.map((v) => ({
    ...v,
    category: categorize(v.title, v.description),
  }))
  const animalVideos = categorized.filter((v) => v.category === 'animal')
  const humanVideos = categorized.filter((v) => v.category === 'human')
  const otherVideos = categorized.filter((v) => v.category === 'other')

  console.log('━'.repeat(60))
  console.log('🏆 조회수 TOP 10')
  console.log('━'.repeat(60))
  byViews.slice(0, 10).forEach((v, i) => {
    console.log(`${String(i + 1).padStart(2)}. [${formatNum(v.views)}회] ${v.title}`)
  })

  console.log()
  console.log('━'.repeat(60))
  console.log('🆕 최근 업로드 10개')
  console.log('━'.repeat(60))
  byDate.slice(0, 10).forEach((v, i) => {
    const date = v.publishedAt.slice(0, 10)
    console.log(`${String(i + 1).padStart(2)}. [${date}] [${formatNum(v.views)}회] ${v.title}`)
  })

  console.log()
  console.log('━'.repeat(60))
  console.log('🐾 동물 관련 콘텐츠 TOP 10')
  console.log('━'.repeat(60))
  if (animalVideos.length === 0) {
    console.log('  (동물 키워드 매칭 영상 없음)')
  } else {
    animalVideos
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .forEach((v, i) => {
        console.log(`${String(i + 1).padStart(2)}. [${formatNum(v.views)}회] ${v.title}`)
      })
  }

  console.log()
  console.log('━'.repeat(60))
  console.log('🧘 인간 치유 콘텐츠 TOP 10')
  console.log('━'.repeat(60))
  humanVideos
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)
    .forEach((v, i) => {
      console.log(`${String(i + 1).padStart(2)}. [${formatNum(v.views)}회] ${v.title}`)
    })

  console.log()
  console.log('━'.repeat(60))
  console.log('📈 콘텐츠 구성 분석')
  console.log('━'.repeat(60))
  const total = videos.length
  const totalViews = videos.reduce((sum, v) => sum + v.views, 0)
  const animalViews = animalVideos.reduce((sum, v) => sum + v.views, 0)
  const humanViews = humanVideos.reduce((sum, v) => sum + v.views, 0)
  const otherViews = otherVideos.reduce((sum, v) => sum + v.views, 0)

  console.log(`분석한 영상 수 : ${total}개`)
  console.log()
  console.log(`🐾 동물 관련    : ${animalVideos.length}개 (${((animalVideos.length / total) * 100).toFixed(1)}%) | 조회수 ${formatNum(animalViews)}회 (${((animalViews / totalViews) * 100).toFixed(1)}%)`)
  console.log(`🧘 인간 치유    : ${humanVideos.length}개 (${((humanVideos.length / total) * 100).toFixed(1)}%) | 조회수 ${formatNum(humanViews)}회 (${((humanViews / totalViews) * 100).toFixed(1)}%)`)
  console.log(`📦 기타         : ${otherVideos.length}개 (${((otherVideos.length / total) * 100).toFixed(1)}%) | 조회수 ${formatNum(otherViews)}회 (${((otherViews / totalViews) * 100).toFixed(1)}%)`)

  // Upload frequency
  if (byDate.length >= 2) {
    const newest = new Date(byDate[0].publishedAt)
    const oldest = new Date(byDate[byDate.length - 1].publishedAt)
    const weeks = (newest - oldest) / (1000 * 60 * 60 * 24 * 7)
    const perWeek = (videos.length / weeks).toFixed(2)
    console.log()
    console.log(`업로드 주기    : 주 평균 ${perWeek}개 (${byDate[byDate.length - 1].publishedAt.slice(0, 10)} ~ ${byDate[0].publishedAt.slice(0, 10)})`)
  }

  // Average views per category
  console.log()
  console.log('━'.repeat(60))
  console.log('💡 마케팅 인사이트')
  console.log('━'.repeat(60))

  const avgTotal = Math.round(totalViews / total)
  const avgAnimal = animalVideos.length
    ? Math.round(animalViews / animalVideos.length)
    : 0
  const avgHuman = humanVideos.length
    ? Math.round(humanViews / humanVideos.length)
    : 0

  console.log(`전체 평균 조회수 : ${formatNum(avgTotal)}회`)
  console.log(`동물 콘텐츠 평균 : ${formatNum(avgAnimal)}회`)
  console.log(`인간 치유 평균   : ${formatNum(avgHuman)}회`)

  if (avgAnimal > 0 && avgHuman > 0) {
    if (avgAnimal > avgHuman) {
      console.log(`\n→ 동물 콘텐츠가 인간 치유 콘텐츠보다 평균 ${((avgAnimal / avgHuman - 1) * 100).toFixed(0)}% 더 높은 조회수`)
      console.log('  tatforanimals.com 타깃 콘텐츠의 높은 퍼포먼스를 뒷받침합니다.')
    } else {
      console.log(`\n→ 인간 치유 콘텐츠가 동물 콘텐츠보다 평균 ${((avgHuman / avgAnimal - 1) * 100).toFixed(0)}% 더 높은 조회수`)
      console.log('  기존 Tapas 팬층은 인간 치유에 더 반응하는 경향이 있습니다.')
    }
  } else if (avgAnimal === 0 && avgHuman > 0) {
    console.log('\n→ 분석한 200개 영상 중 동물 특화 콘텐츠 비중이 매우 낮음')
    console.log('  tatforanimals.com은 유튜브에서 아직 개척되지 않은 블루오션입니다.')
  }

  const top3 = byViews.slice(0, 3)
  console.log(`\n최고 조회수 3개 영상 패턴:`)
  top3.forEach((v) => {
    console.log(`  - "${v.title}" (${formatNum(v.views)}회)`)
  })

  // ── 연도별 업로드 & 조회수 트렌드 ──────────────────────
  console.log()
  console.log('━'.repeat(60))
  console.log('📅 연도별 트렌드')
  console.log('━'.repeat(60))

  const byYear = {}
  for (const v of videos) {
    const yr = v.publishedAt.slice(0, 4)
    if (!byYear[yr]) byYear[yr] = { count: 0, views: 0, likes: 0 }
    byYear[yr].count++
    byYear[yr].views += v.views
    byYear[yr].likes += v.likes
  }
  const years = Object.keys(byYear).sort()
  console.log('연도   | 업로드 | 총 조회수  | 평균 조회수 | 평균 좋아요')
  console.log('-------|--------|-----------|-------------|------------')
  for (const yr of years) {
    const d = byYear[yr]
    const avgV = Math.round(d.views / d.count)
    const avgL = Math.round(d.likes / d.count)
    console.log(
      `${yr}   | ${String(d.count).padStart(6)} | ${formatNum(d.views).padStart(9)} | ${formatNum(avgV).padStart(11)} | ${formatNum(avgL).padStart(11)}`
    )
  }

  // ── 참여율(Engagement Rate) 분석 ──────────────────────
  console.log()
  console.log('━'.repeat(60))
  console.log('💬 참여율 TOP 10 (좋아요+댓글 / 조회수)')
  console.log('━'.repeat(60))
  console.log('※ 조회수 50회 이상 영상만 포함\n')

  const withEngagement = videos
    .filter((v) => v.views >= 50)
    .map((v) => ({
      ...v,
      engagementRate: ((v.likes + v.comments) / v.views) * 100,
    }))
    .sort((a, b) => b.engagementRate - a.engagementRate)

  withEngagement.slice(0, 10).forEach((v, i) => {
    console.log(
      `${String(i + 1).padStart(2)}. [참여율 ${v.engagementRate.toFixed(2)}%] [${formatNum(v.views)}회] ${v.title}`
    )
  })

  const avgEngagement =
    withEngagement.reduce((s, v) => s + v.engagementRate, 0) / withEngagement.length
  console.log(`\n전체 평균 참여율: ${avgEngagement.toFixed(2)}%`)
  console.log('(YouTube 평균 참여율: 0.5–2% — 이 기준과 비교하세요)')

  // ── 제목 단어 빈도 분석 ──────────────────────────────
  console.log()
  console.log('━'.repeat(60))
  console.log('🔤 고성과 제목 키워드 분석')
  console.log('━'.repeat(60))
  console.log('(상위 25% 고조회수 영상 vs 하위 25% 저조회수 영상 비교)\n')

  const sortedForKeywords = [...videos].sort((a, b) => b.views - a.views)
  const quartileSize = Math.floor(sortedForKeywords.length / 4)
  const topQuartile = sortedForKeywords.slice(0, quartileSize)
  const bottomQuartile = sortedForKeywords.slice(-quartileSize)

  const STOPWORDS = new Set([
    'with', 'and', 'for', 'the', 'a', 'an', 'of', 'in', 'to', 'on',
    'is', 'it', 'by', 'or', 'at', 'your', 'you', 'from', 'how', 'what',
    'that', 'this', 'do', 'can', 'i', 'my', 'not', 'are', 'be', 'has',
    'was', 'tip', 'tapas', 'fleming', 'tat', 'tat®', '–', '--', '|',
  ])

  function wordFreq(videoList) {
    const freq = {}
    for (const v of videoList) {
      const words = v.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOPWORDS.has(w))
      for (const w of words) {
        freq[w] = (freq[w] ?? 0) + 1
      }
    }
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 15)
  }

  const topWords = wordFreq(topQuartile)
  const bottomWords = wordFreq(bottomQuartile)
  const bottomWordMap = Object.fromEntries(bottomWords)

  console.log('고성과 영상에 자주 등장하는 단어 (저성과에는 없거나 드문 것):')
  const uniqueTopWords = topWords.filter(
    ([w, c]) => c > (bottomWordMap[w] ?? 0)
  )
  uniqueTopWords.slice(0, 10).forEach(([w, c]) => {
    const bottomCount = bottomWordMap[w] ?? 0
    const marker = bottomCount === 0 ? ' ★ (저성과에 없음)' : ''
    console.log(`  "${w}" — 고성과 ${c}회 / 저성과 ${bottomCount}회${marker}`)
  })

  // ── 구독자 대비 조회수 효율 분석 ─────────────────────
  console.log()
  console.log('━'.repeat(60))
  console.log('📡 채널 디스커버리 분석')
  console.log('━'.repeat(60))

  const subscriberCount = parseInt(channelStats.subscriberCount ?? '0')
  const totalViewCount = parseInt(channelStats.viewCount ?? '0')
  const videoCount = parseInt(channelStats.videoCount ?? '0')
  const viewsPerSub = Math.round(totalViewCount / subscriberCount)
  const viewsPerVideo = Math.round(totalViewCount / videoCount)

  console.log(`구독자당 총 조회수 비율 : ${viewsPerSub}회/구독자`)
  console.log(`영상당 평균 조회수     : ${formatNum(viewsPerVideo)}회/영상`)
  console.log()

  if (viewsPerSub < 30) {
    console.log('→ 구독자 대비 조회수가 낮음 (업계 평균: 50–200배)')
    console.log('  대부분의 조회수가 구독자가 아닌 검색/추천에서 유입됨을 시사')
    console.log('  → SEO 최적화된 제목/설명이 신규 유입의 핵심 레버')
  } else {
    console.log('→ 구독자 충성도가 높음 — 구독자들이 꾸준히 시청 중')
  }

  // ── 경쟁 채널 탐색 ───────────────────────────────────
  console.log()
  console.log('━'.repeat(60))
  console.log('🔍 경쟁/인접 채널 탐색')
  console.log('━'.repeat(60))

  const competitorQueries = [
    { q: 'TAT for animals', label: '"TAT for animals" 검색 상위 영상' },
    { q: 'animal healing technique', label: '"animal healing technique" 검색 상위 영상' },
    { q: 'calm anxious dog technique', label: '"calm anxious dog technique" 검색 상위 영상' },
  ]

  for (const { q, label } of competitorQueries) {
    try {
      const results = await get('search', {
        part: 'snippet',
        q,
        type: 'video',
        maxResults: 5,
        order: 'relevance',
        relevanceLanguage: 'en',
      })
      console.log(`\n${label}:`)
      for (const item of results.items ?? []) {
        const channelName = item.snippet.channelTitle
        const title = item.snippet.title
        const isTATLife = channelName.toLowerCase().includes('tat') || channelName.toLowerCase().includes('tapas')
        const marker = isTATLife ? ' ← TATLife' : ''
        console.log(`  · [${channelName}${marker}] "${title}"`)
      }
    } catch {
      console.log(`  (검색 오류 — 할당량 초과 시 내일 재시도)`)
    }
  }

  // ── 채널 내 동물 콘텐츠 탐색 (YouTube 검색 엔진 기반) ──
  console.log()
  console.log('━'.repeat(60))
  console.log('🐾 채널 내 동물 관련 영상 탐색 (YouTube 검색 기반)')
  console.log('━'.repeat(60))
  console.log('※ 키워드 매칭이 아닌 YouTube 자체 검색 알고리즘 사용\n')

  const animalQueries = ['animal', 'dog', 'cat', 'pet', 'horse', 'bird', 'rabbit']
  const foundIds = new Set()
  const animalResults = []

  for (const q of animalQueries) {
    try {
      const results = await get('search', {
        part: 'snippet',
        q,
        channelId: channel.id,
        type: 'video',
        maxResults: 10,
        order: 'relevance',
      })
      for (const item of results.items ?? []) {
        const id = item.id.videoId
        if (!foundIds.has(id)) {
          foundIds.add(id)
          animalResults.push({
            id,
            title: item.snippet.title,
            publishedAt: item.snippet.publishedAt,
          })
        }
      }
    } catch {
      console.log(`  (검색 오류 — "${q}" 쿼리 실패)`)
    }
  }

  // Enrich with view counts
  const animalEnriched = await enrichWithStats(animalResults)
  animalEnriched.sort((a, b) => b.views - a.views)

  console.log(`총 ${animalEnriched.length}개 영상 감지됨:\n`)
  animalEnriched.forEach((v, i) => {
    const date = v.publishedAt.slice(0, 7)
    console.log(`${String(i + 1).padStart(2)}. [${formatNum(v.views)}회] [${date}] ${v.title}`)
  })

  console.log('\n' + '━'.repeat(60))
  console.log('분석 완료.')
  console.log('━'.repeat(60) + '\n')
}

main().catch((err) => {
  console.error('오류:', err.message)
  process.exit(1)
})
