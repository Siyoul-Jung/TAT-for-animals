#!/usr/bin/env node
// scripts/betsey-duplicates.mjs
//
// Find (and optionally delete) the leftover "Betsy"-misspelled duplicate
// recordings in Sanity. Tapas approved removing the old duplicates
// (2026-08-27) — but only the ones that already have a correctly-spelled
// "Betsey" counterpart in the library; a "Betsy" doc with NO counterpart
// should be RENAMED, not deleted, so we never lose a one-of-a-kind session.
//
// This is deliberately two-step and safe:
//   node scripts/betsey-duplicates.mjs           → DRY RUN. Lists every
//       "Betsy" doc, the "Betsey" match found (if any), and classifies each
//       as DELETE (has a correct counterpart) or KEEP+RENAME (no counterpart).
//       Nothing is changed.
//   node scripts/betsey-duplicates.mjs --delete  → Actually deletes ONLY the
//       docs classified DELETE above, printing each one as it goes.
//
// Requires (read from process.env, or auto-loaded from .env.local / .env):
//   NEXT_PUBLIC_SANITY_PROJECT_ID   (required)
//   SANITY_API_TOKEN                (required; needs write scope for --delete)
//   NEXT_PUBLIC_SANITY_DATASET      (optional, defaults to 'production')
//
// Run from the repo root. Uses @sanity/client, already a project dependency.

import { readFileSync } from 'node:fs'
import { createClient } from '@sanity/client'

// ── Minimal .env loader (no extra dependency) ────────────────────────────────
// Next.js keeps local secrets in .env.local; fall back to .env. We only fill in
// keys that aren't already set in the real environment, so a value exported in
// the shell always wins.
for (const file of ['.env.local', '.env']) {
  try {
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (!m) continue
      const key = m[1]
      let val = m[2].trim().replace(/^["']|["']$/g, '')
      if (val && process.env[key] === undefined) process.env[key] = val
    }
  } catch {
    // file absent — fine, env may already hold the values
  }
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN
const DELETE = process.argv.includes('--delete')

if (!projectId) {
  console.error('✗ NEXT_PUBLIC_SANITY_PROJECT_ID is not set. Aborting.')
  process.exit(1)
}
if (!token) {
  console.error('✗ SANITY_API_TOKEN is not set (needed to read this dataset, and to delete). Aborting.')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

// "betsey" (correct) never contains the substring "betsy", so a plain
// case-insensitive substring test cleanly separates the two spellings.
const hasBetsy = (t) => !!t && t.toLowerCase().includes('betsy')
const hasBetsey = (t) => !!t && t.toLowerCase().includes('betsey')
// Normalize a misspelled title to its corrected form so we can pair a
// "Betsy ..." doc with the matching "Betsey ..." doc by title.
const corrected = (t) => (t || '').toLowerCase().replace(/betsy/g, 'betsey').trim()

async function main() {
  // Pull both content types. coalesce() gives one `date` field whether the doc
  // is a video (dateRecorded) or a webinarRecording (date).
  const docs = await client.fetch(
    `*[_type in ["video", "webinarRecording"]]{
      _id, _type, title, videoUrl, "date": coalesce(date, dateRecorded), category
    } | order(title asc)`
  )

  const betsy = docs.filter((d) => hasBetsy(d.title) && !hasBetsey(d.title))
  const betsey = docs.filter((d) => hasBetsey(d.title))

  console.log(`\nScanned ${docs.length} docs — found ${betsy.length} "Betsy" (misspelled) and ${betsey.length} "Betsey" (correct).\n`)

  if (betsy.length === 0) {
    console.log('Nothing spelled "Betsy" — no duplicates to clean up. Done.')
    return
  }

  const toDelete = []
  const toRename = []

  for (const d of betsy) {
    // A confident counterpart: a correctly-spelled doc that either has the same
    // title once corrected, or points at the exact same Vimeo video.
    const match = betsey.find(
      (b) => corrected(b.title) === corrected(d.title) || (!!d.videoUrl && b.videoUrl === d.videoUrl)
    )
    if (match) toDelete.push({ d, match })
    else toRename.push(d)
  }

  console.log('─'.repeat(72))
  console.log(`DELETE candidates (misspelled duplicate WITH a correct "Betsey" counterpart): ${toDelete.length}`)
  console.log('─'.repeat(72))
  for (const { d, match } of toDelete) {
    console.log(`  • [${d._type}] "${d.title}"  (${d.date ?? 'no date'})  _id=${d._id}`)
    console.log(`      ↳ counterpart kept: "${match.title}"  _id=${match._id}`)
  }
  if (toDelete.length === 0) console.log('  (none)')

  console.log('\n' + '─'.repeat(72))
  console.log(`KEEP + RENAME (misspelled but NO correct counterpart — do NOT delete): ${toRename.length}`)
  console.log('─'.repeat(72))
  for (const d of toRename) {
    console.log(`  • [${d._type}] "${d.title}"  (${d.date ?? 'no date'})  _id=${d._id}`)
    console.log(`      ↳ suggest renaming title to: "${(d.title || '').replace(/betsy/gi, (m) => (m[0] === 'B' ? 'Betsey' : 'betsey'))}"`)
  }
  if (toRename.length === 0) console.log('  (none)')
  console.log('')

  if (!DELETE) {
    console.log('DRY RUN — nothing was changed.')
    if (toDelete.length > 0) {
      console.log('Re-run with --delete to remove the DELETE candidates above.')
    }
    if (toRename.length > 0) {
      console.log('The KEEP + RENAME items are left for you to fix by hand in Studio (safer than an automated rename).')
    }
    return
  }

  if (toDelete.length === 0) {
    console.log('Nothing to delete. Done.')
    return
  }

  console.log(`Deleting ${toDelete.length} confirmed duplicate(s)…\n`)
  for (const { d } of toDelete) {
    try {
      await client.delete(d._id)
      console.log(`  ✓ deleted [${d._type}] "${d.title}"  _id=${d._id}`)
    } catch (e) {
      console.error(`  ✗ FAILED to delete _id=${d._id}: ${e.message}`)
    }
  }
  console.log('\nDone. (KEEP + RENAME items above were left untouched — rename those in Studio.)')
}

main().catch((e) => {
  console.error('Unexpected error:', e.message)
  process.exit(1)
})
