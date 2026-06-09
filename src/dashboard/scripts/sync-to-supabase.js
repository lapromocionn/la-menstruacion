#!/usr/bin/env node
/**
 * Reads obsidian_brain XML/MD files and upserts to Supabase.
 * Run: node scripts/sync-to-supabase.js
 * Requires: SUPABASE_SERVICE_ROLE_KEY and VITE_SUPABASE_URL in .env.local
 */
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dir = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dir, '../../../..')

// Load .env.local manually (no dotenv dependency needed)
function loadEnv() {
  try {
    const raw = readFileSync(resolve(__dir, '../.env.local'), 'utf8')
    const env = {}
    for (const line of raw.split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/)
      if (m) env[m[1].trim()] = m[2].trim()
    }
    return env
  } catch { return {} }
}

const env = loadEnv()
const URL = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!URL || !KEY) {
  console.error('ERROR: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const sb = createClient(URL, KEY)

function extractSkills(md) {
  const skills = []
  const re = /<skill_observed>([\s\S]*?)<\/skill_observed>/g
  let m
  while ((m = re.exec(md)) !== null) {
    const block = m[1]
    const get = tag => { const t = block.match(new RegExp(`<${tag}>(.*?)<\/${tag}>`)); return t?.[1]?.trim() ?? null }
    skills.push({
      human: get('human'),
      skill: get('skill'),
      evidence: get('evidence'),
      autonomy: get('autonomy') ?? 'high',
      observed_date: get('date')
    })
  }
  return skills
}

function extractSessions(md) {
  const sessions = []
  const re = /<session>([\s\S]*?)<\/session>/g
  let m
  while ((m = re.exec(md)) !== null) {
    const block = m[1]
    const get = tag => { const t = block.match(new RegExp(`<${tag}>(.*?)<\/${tag}>`, 's')); return t?.[1]?.trim() ?? null }
    const tasksRaw = get('tasks_completed') ?? ''
    const skillsRaw = get('skills_observed') ?? ''
    const prioritiesRaw = get('next_priorities') ?? ''
    sessions.push({
      session_date: get('date'),
      duration: get('duration'),
      tasks_completed: tasksRaw.split('\n').map(l => l.replace(/^\s*-\s*/, '').trim()).filter(Boolean),
      skills_observed: skillsRaw.split('\n').map(l => l.replace(/^\s*-\s*/, '').trim()).filter(Boolean),
      next_priorities: prioritiesRaw.split('\n').map(l => l.replace(/^\s*-\s*/, '').trim()).filter(Boolean)
    })
  }
  return sessions
}

function extractStats(md) {
  const statsBlock = md.match(/<stats>([\s\S]*?)<\/stats>/)
  if (!statsBlock) return null
  const b = statsBlock[1]
  const get = tag => { const t = b.match(new RegExp(`<${tag}>(.*?)<\/${tag}>`)); return parseInt(t?.[1]?.trim()) || 0 }
  return {
    sessions_logged: get('sessions_logged'),
    skills_detected_socio1: get('skills_detected_socio1'),
    skills_detected_socio2: get('skills_detected_socio2'),
    last_updated: new Date().toISOString()
  }
}

async function sync() {
  console.log('→ Syncing obsidian_brain to Supabase...')

  try {
    const skillsMd = readFileSync(resolve(root, 'obsidian_brain/04_Analisis_Equipo/habilidades_base.md'), 'utf8')
    const sessionsMd = readFileSync(resolve(root, 'obsidian_brain/02_Buzon_IA/session_log.md'), 'utf8')

    // Sync skills
    const skills = extractSkills(skillsMd)
    if (skills.length) {
      const { error } = await sb.from('skills').upsert(skills, { onConflict: 'human,skill' })
      if (error) console.error('skills error:', error.message)
      else console.log(`✓ ${skills.length} skills synced`)
    }

    // Sync sessions
    const sessions = extractSessions(sessionsMd)
    if (sessions.length) {
      const { error } = await sb.from('sessions').upsert(sessions, { onConflict: 'session_date' })
      if (error) console.error('sessions error:', error.message)
      else console.log(`✓ ${sessions.length} sessions synced`)
    }

    // Sync ecosystem stats
    const stats = extractStats(skillsMd)
    if (stats) {
      const { data: existing } = await sb.from('ecosystem_stats').select('id').limit(1).single()
      if (existing) {
        await sb.from('ecosystem_stats').update(stats).eq('id', existing.id)
      } else {
        await sb.from('ecosystem_stats').insert(stats)
      }
      console.log('✓ Ecosystem stats synced')
    }

    console.log('✓ Sync complete.')
  } catch (err) {
    console.error('Sync failed:', err.message)
    process.exit(1)
  }
}

sync()
