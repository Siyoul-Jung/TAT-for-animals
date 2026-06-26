import { createClient } from '@/lib/supabase/client'

export type VideoProgress = {
  lastPosition: number
  completed: boolean
}

export type ProgressMap = Record<string, VideoProgress>

export async function loadAllProgress(): Promise<ProgressMap> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return {}

  const { data, error } = await supabase
    .from('video_watch_events')
    .select('content_id, last_position, completed')
    .eq('user_id', user.id)

  if (error) console.error('loadAllProgress failed:', error.message)
  if (!data) return {}

  return Object.fromEntries(
    data.map((row) => [row.content_id, { lastPosition: row.last_position, completed: row.completed }])
  )
}

export async function saveProgress(
  contentId: string,
  lastPosition: number,
  completed: boolean
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // content_type is NOT NULL with no default — omitting it made every upsert
  // fail silently (the error was never checked), so progress never persisted
  // and the bars/checks vanished on refresh. Library rows are always videos.
  const { error } = await supabase
    .from('video_watch_events')
    .upsert(
      {
        user_id: user.id,
        content_id: contentId,
        content_type: 'video',
        last_position: Math.floor(lastPosition),
        completed,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,content_id' }
    )
  if (error) console.error('saveProgress failed:', error.message)
}
