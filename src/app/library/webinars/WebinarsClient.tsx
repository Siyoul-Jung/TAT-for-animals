export {}

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return match?.[1] ?? null
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  })
}

function RecordingCard({ recording }: { recording: WebinarRecording }) {
  const [playing, setPlaying] = useState(false)
  const vimeoId = getVimeoId(recording.videoUrl)

  return (
    <div className="bg-white rounded-2xl border border-charcoal/10 overflow-hidden shadow-sm">
      <div className="relative aspect-video bg-charcoal">
        {playing && vimeoId ? (
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1`}
            title={recording.title}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="absolute inset-0 w-full h-full flex items-center justify-center group"
            aria-label={`Watch ${recording.title}`}
          >
            <span className="w-16 h-16 rounded-full bg-brand flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" className="text-cream ml-0.5">
                <path d="M3 2.5l13 6.5-13 6.5V2.5z" />
              </svg>
            </span>
          </button>
        )}
      </div>

      <div className="p-5">
        <p className="text-sm text-charcoal/40 mb-1">{formatDate(recording.date)}</p>
        <p className="font-semibold text-charcoal text-base leading-snug mb-2">{recording.title}</p>
        {recording.summary && (
          <p className="text-sm text-charcoal/60 leading-relaxed">{recording.summary}</p>
        )}
      </div>
    </div>
  )
}

export default function WebinarsClient({
  recordings,
  upcoming,
}: {
  recordings: WebinarRecording[]
  upcoming: WebinarSession[]
}) {
  return (
    <main className="min-h-screen bg-cream pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto space-y-10">

        <div>
          <p className="text-sm font-medium text-charcoal/40 uppercase tracking-widest mb-1">
            The Calm Circle
          </p>
          <h1 className="font-serif text-3xl text-charcoal">Live Sessions</h1>
          <p className="text-charcoal/50 mt-1 text-base">
            Monthly live sessions with Tapas, plus the full archive.
          </p>
        </div>

        {upcoming.length > 0 && (
          <section className="bg-white rounded-2xl border border-charcoal/10 p-7 shadow-sm space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-charcoal/40">
              Upcoming
            </h2>
            <div className="divide-y divide-charcoal/8">
              {upcoming.map((session) => (
                <div key={session._id} className="py-4 first:pt-0 last:pb-0">
                  <p className="text-sm text-charcoal/40 mb-0.5">{formatDateTime(session.date)}</p>
                  <p className="font-semibold text-charcoal text-base">{session.title}</p>
                  {session.description && (
                    <p className="text-sm text-charcoal/60 mt-1 leading-relaxed">{session.description}</p>
                  )}
                  {session.meetingUrl && (
                    <a
                      href={session.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 min-h-[44px] px-5 py-2.5 rounded-full bg-brand text-cream text-sm font-semibold hover:bg-brand-dark transition-all"
                    >
                      Join on Zoom →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-charcoal/40">
            Past Recordings
          </h2>
          {recordings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-charcoal/10 p-7 shadow-sm">
              <p className="text-charcoal/60 text-base">
                Recordings will appear here after each live session.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {recordings.map((rec) => (
                <RecordingCard key={rec._id} recording={rec} />
              ))}
            </div>
          )}
        </section>

        <Link
          href="/library"
          className="inline-flex items-center gap-2 text-sm text-charcoal/40 hover:text-charcoal/70 transition-colors min-h-[44px]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 12L6 8l4-4" />
          </svg>
          Library
        </Link>

      </div>
    </main>
  )
}
