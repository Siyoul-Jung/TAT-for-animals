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

  const { data } = await supabase
    .from('video_watch_events')
    .select('content_id, last_position, completed')
    .eq('user_id', user.id)

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

  await supabase
    .from('video_watch_events')
    .upsert(
      {
        user_id: user.id,
        content_id: contentId,
        last_position: Math.floor(lastPosition),
        completed,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,content_id' }
    )
}
