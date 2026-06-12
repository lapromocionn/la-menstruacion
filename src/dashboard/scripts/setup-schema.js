#!/usr/bin/env node
/**
 * Runs supabase/schema.sql on the project via the Supabase Management API.
 * Requires a Personal Access Token (not the service role key):
 *   https://supabase.com/dashboard/account/tokens
 *
 * Usage:
 *   SUPABASE_PAT=sbp_xxx node scripts/setup-schema.js
 */
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const PROJECT_REF = 'ufcufpdtedvvvwcwwywg'

function loadEnv() {
  try {
    const raw = readFileSync(resolve(__dir, '../.env.local'), 'utf8')
    const env = {}
    for (const line of raw.split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/)
      if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '')
    }
    return env
  } catch { return {} }
}

const env = loadEnv()
const PAT = process.env.SUPABASE_PAT || env.SUPABASE_PAT

if (!PAT) {
  console.error(`
ERROR: No Personal Access Token found.
Set SUPABASE_PAT in .env.local or pass as env var:

  SUPABASE_PAT=sbp_xxx node scripts/setup-schema.js

Get your PAT at: https://supabase.com/dashboard/account/tokens
`)
  process.exit(1)
}

const sql = readFileSync(resolve(__dir, '../supabase/schema.sql'), 'utf8')

// Split into individual statements; strip leading comment lines before filtering
const statements = sql
  .split(';')
  .map(s => s.trim())
  .map(s => s.replace(/^(--[^\n]*\n\s*)*/m, '').trim())
  .filter(s => s && !s.startsWith('--'))

console.log(`→ Running ${statements.length} SQL statements on project ${PROJECT_REF}...`)

let ok = 0, fail = 0

for (const stmt of statements) {
  const query = stmt + ';'
  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAT}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    })

    const body = await res.json()

    if (!res.ok) {
      // Ignore "already exists" errors — idempotent
      const msg = body.message ?? body.error ?? JSON.stringify(body)
      if (msg.includes('already exists') || msg.includes('duplicate')) {
        console.log(`  skip (exists): ${query.slice(0, 60).replace(/\n/g, ' ')}…`)
      } else {
        console.error(`  FAIL: ${msg}`)
        console.error(`  SQL: ${query.slice(0, 80)}`)
        fail++
      }
    } else {
      ok++
      if (ok % 5 === 0) console.log(`  ✓ ${ok} statements run`)
    }
  } catch (err) {
    console.error(`  FETCH ERROR: ${err.message}`)
    fail++
  }
}

console.log(`\n${fail === 0 ? '✓' : '✗'} Done — ${ok} OK, ${fail} failed.`)
if (fail > 0) process.exit(1)
