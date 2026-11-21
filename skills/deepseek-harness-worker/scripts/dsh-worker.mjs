#!/usr/bin/env node
// dsh-worker: Codex から DeepSeek Harness（DSH）のセッションへ指示を送り、結果を回収する。
// 経路: アプリ起動中は内部 Web API（GUI にもそのまま表示される）、未起動時は同梱 CLI の dsh headless。
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { execFileSync, spawn } from 'node:child_process'
import { createHash, createHmac, randomUUID } from 'node:crypto'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'

const DSH_HOME = process.env.DSH_HOME ?? join(homedir(), '.dsh')
const APP = process.env.DSH_APP ?? '/Applications/DeepSeek Harness.app'
const APP_EXE = join(APP, 'Contents/MacOS/DeepSeek Harness')
const APP_ASAR = join(APP, 'Contents/Resources/app.asar')
const APP_CLI = join(APP, 'Contents/Resources/app.asar/dsh/node_modules/@deepseek-ai/dsh-desktop-host/lib/cli.js')
const DESKTOP_PATCH = join(DSH_HOME, 'profiles/desktop/cordis.patch.yml')
const b64url = (buf) => Buffer.from(buf).toString('base64').replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '')
const sleep = (ms) => new Promise(r => setTimeout(r, ms))
const normId = (id) => !id ? id : id.startsWith('session-') ? id : 'session-' + id
const credentialsText = () => readFileSync(join(DSH_HOME, '.credentials.yaml'), 'utf8')

// ---------- 引数 ----------
const argv = process.argv.slice(2)
const cmd = argv.shift()
const opts = {}; const pos = []
const VALUE_FLAGS = new Set(['cwd', 'model', 'route', 'timeout', 'permission-mode', 'approval-policy', 'add-dir', 'preset', 'workspace-project'])
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a === '-') { pos.push(a); continue }
  if (a.startsWith('--')) {
    const k = a.slice(2)
    if (VALUE_FLAGS.has(k)) { const v = argv[++i]; if (k === 'add-dir') (opts[k] ??= []).push(v); else opts[k] = v }
    else opts[k] = true
  } else pos.push(a)
}
const out = (obj, textForHuman) => { if (opts.json) console.log(JSON.stringify(obj)); else if (textForHuman !== undefined) console.log(textForHuman) }
const log = (...m) => { if (!opts.quiet) console.error('[dsh-worker]', ...m) }

// ---------- アプリ経路（内部 Web API） ----------
function appOrigin() {
  if (process.env.DSH_URL) return process.env.DSH_URL.replace(/\/$/u, '')
  let s = ''
  try { s = execFileSync('lsof', ['-nP', '-iTCP', '-sTCP:LISTEN', '-a', '-c', 'DeepSeek'], { encoding: 'utf8' }) } catch {}
  const m = /127\.0\.0\.1:(\d+) \(LISTEN\)/u.exec(s)
  return m ? 'http://127.0.0.1:' + m[1] : undefined
}

function appCookie(origin) {
  const block = credentialsText().split(/\n(?=  \S)/u).find(b => b.startsWith('  client-connection/browser-session:'))
  const m = block && /\n\s+secret:\s*['"]?([A-Za-z0-9_-]+)/u.exec(block)
  if (!m) throw new Error('DSH の Web ログイン署名鍵（client-connection/browser-session）が見つかりません')
  const secret = Buffer.from(m[1].replaceAll('-', '+').replaceAll('_', '/'), 'base64')
  const authority = new URL(origin).host
  const now = Date.now()
  const body = b64url(JSON.stringify({ version: 1, authority, issuedAt: now - 1000, expiresAt: now + 10 * 60 * 1000 }))
  const sig = b64url(createHmac('sha256', secret).update(body).digest())
  return 'dsh-auth-' + b64url(createHash('sha256').update(authority).digest()) + '=v1.' + body + '.' + sig
}

let appCtx
async function api(method, args, retry = true) {
  if (!appCtx) {
    const origin = appOrigin()
    if (!origin) throw new Error('DeepSeek Harness アプリが起動していません（この操作はアプリ起動中のみ）')
    appCtx = { origin, cookie: appCookie(origin) }
  }
  const res = await fetch(appCtx.origin + '/api/' + method, {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: appCtx.cookie },
    body: JSON.stringify({ type: 'client-request', rpcId: randomUUID(), method, payload: { args } }),
  })
  if (res.status === 401 && retry) { appCtx = undefined; return api(method, args, false) }
  const text = await res.text()
  let json; try { json = JSON.parse(text) } catch { json = text }
  if (!res.ok) throw new Error(method + ' -> HTTP ' + res.status + ': ' + (typeof json === 'string' ? json : JSON.stringify(json)))
  const result = json?.result ?? json
  if (result?.ok === false) throw new Error(method + ' -> ' + JSON.stringify(result.error))
  return result?.value ?? result
}

async function headSeq(sessionId) {
  try {
    await api('session/page', { request: { address: { kind: 'session', sessionId }, throughSeq: Number.MAX_SAFE_INTEGER, maxMessages: 1 } })
  } catch (e) {
    const m = /exceeds (\d+)/u.exec(String(e.message)); if (m) return Number(m[1]); throw e
  }
  return Number.MAX_SAFE_INTEGER
}

const textOf = (content) => (content ?? []).filter(c => c.type === 'text').map(c => c.text).join('\n')
async function history(sessionId, maxMessages = 6) {
  const page = await api('session/page', { request: { address: { kind: 'session', sessionId }, throughSeq: await headSeq(sessionId), maxMessages } })
  const res = []
  for (const r of page.records ?? []) {
    const e = r.event ?? r
    if (e.type === 'user/message' && e.data?.source?.kind === 'user') res.push({ seq: e.seq, role: 'user', text: textOf(e.data.content), rpcId: e.data.source.rpcId })
    else if (e.type === 'assistant/message') res.push({ seq: e.seq, role: 'assistant', text: textOf(e.data?.message?.content) })
    else if (e.type === 'turn/end') res.push({ seq: e.seq, role: 'turn-end', reason: e.data?.reason ?? {} })
  }
  return res
}

// Locate the actual submitted request even if a long turn produced more than one page.
async function historyForRequest(sessionId, requestId) {
  let throughSeq = await headSeq(sessionId)
  const events = []
  for (;;) {
    const page = await api('session/page', { request: { address: { kind: 'session', sessionId }, throughSeq, maxMessages: 100 } })
    const records = (page.records ?? []).map(r => r.event ?? r)
    if (!records.length) break
    for (const e of records) {
      if (e.type === 'user/message' && e.data?.source?.kind === 'user') events.push({ seq: e.seq, role: 'user', text: textOf(e.data.content), rpcId: e.data.source.rpcId })
      else if (e.type === 'assistant/message') events.push({ seq: e.seq, role: 'assistant', text: textOf(e.data?.message?.content) })
      else if (e.type === 'turn/end') events.push({ seq: e.seq, role: 'turn-end', reason: e.data?.reason ?? {} })
    }
    if (events.some(e => e.role === 'user' && e.rpcId === requestId)) break
    const first = Math.min(...records.map(e => e.seq).filter(Number.isFinite))
    if (!Number.isFinite(first) || first <= 1 || first > throughSeq) break
    throughSeq = first - 1
  }
  return events.sort((a, b) => a.seq - b.seq)
}

async function sessionRow(sessionId) {
  return ((await api('session/list', { _request: {} })).items ?? []).find(i => i.sessionId === sessionId)
}

async function appSelectModel(sessionId, model) {
  const [provider, ...rest] = model.split('/')
  if (!provider || rest.length === 0) throw new Error('--model は provider/model 形式で指定してください（dsh-worker models で一覧）')
  await api('session/selectModel', { request: { sessionId, provider, model: rest.join('/') } })
}

async function appRun(sessionId, prompt) {
  const preset = opts['permission-mode']
  if (preset) {
    if (cmd !== 'new') throw new Error('アプリ経路で --permission-mode を指定できるのは new のみです')
    const permission = line => api('commands/execute', { agentId: sessionId, line, submittedAttachments: [] })
    const set = (await permission('/permission ' + preset))?.result
    if (set?.kind !== 'success') throw new Error('権限の設定に失敗しました。指示は未送信です: ' + (set?.text ?? preset))
    const current = (await permission('/permission'))?.result
    if (current?.kind !== 'success' || !current.text?.startsWith('current preset ' + preset + ' (')) {
      throw new Error('セッションの権限を確認できませんでした。指示は未送信です')
    }
    log('セッション権限:', preset)
  }
  if (opts.model) await appSelectModel(sessionId, opts.model)
  const requestId = randomUUID()
  await api('session/prompt', { request: {
    requestId, sessionId, mode: opts.steer ? 'steer' : 'queue',
    content: [{ type: 'text', text: prompt }], clientTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  } })
  log('送信しました（app）:', sessionId)
  if (opts['no-wait']) return out({ route: 'app', sessionId, status: 'sent' }, sessionId)
  const timeoutMs = Number(opts.timeout ?? 30 * 60) * 1000
  const started = Date.now()
  let lastNotice = 0
  for (;;) {
    await sleep(3000)
    const h = await historyForRequest(sessionId, requestId)
    const mine = h.findIndex(x => x.role === 'user' && x.rpcId === requestId)
    const after = mine >= 0 ? h.slice(mine + 1) : []
    const end = after.find(x => x.role === 'turn-end')
    if (end) {
      const text = after.filter(x => x.role === 'assistant' && x.text.trim()).map(x => x.text).join('\n\n')
      const status = end.reason?.kind ?? 'unknown'
      out({ route: 'app', sessionId, status, reason: end.reason, text }, text)
      if (status !== 'completed') { log('ターン終了理由:', JSON.stringify(end.reason)); process.exit(4) }
      return
    }
    const row = await sessionRow(sessionId)
    const pending = row?.projections?.values?.userQuestions?.active ?? []
    if (pending.length > 0 && Date.now() - lastNotice > 60000) {
      lastNotice = Date.now()
      log('DSH が承認・質問の回答待ちです（アプリ画面で回答が必要）:', JSON.stringify(pending).slice(0, 500))
      if (opts['fail-on-question']) { out({ route: 'app', sessionId, status: 'awaiting-user', pending }); process.exit(3) }
    }
    if (Date.now() - started > timeoutMs) {
      out({ route: 'app', sessionId, status: 'timeout' })
      log('待機時間切れ。DSH 側では処理が続いている可能性があります。後で read で回収してください。')
      process.exit(2)
    }
  }
}

// ---------- CLI 経路（同梱 dsh headless） ----------
function cliEnv() {
  // アプリ（Web版プロファイル）が使う API キー参照 refs を、子プロセスの環境変数にだけ渡す
  const env = { ...process.env, ELECTRON_RUN_AS_NODE: '1' }
  const t = credentialsText(); const i = t.indexOf('\nrefs:')
  if (i >= 0) for (const line of t.slice(i + 7).split('\n')) {
    const m = /^\s+([A-Za-z0-9_]+):\s*["']?(.*?)["']?\s*$/u.exec(line); if (!m) break
    if (env[m[1]] === undefined) env[m[1]] = m[2]
  }
  return env
}

function cliRun(sessionId, prompt, cwd) {
  if (!existsSync(APP_ASAR)) throw new Error('同梱 CLI が見つかりません: ' + APP_CLI)
  if (opts.model) throw new Error('--model はアプリ経路でのみ指定できます（CLI 経路はデスクトップ設定の既定モデルを使います）')
  const args = ['--expose-internals', APP_CLI, '--profile', 'headless']
  if (existsSync(DESKTOP_PATCH)) args.push('--patch', DESKTOP_PATCH)
  args.push('--json')
  if (sessionId) args.push('--session-id', sessionId)
  if (opts['permission-mode']) args.push('--permission-mode', opts['permission-mode'])
  if (opts['approval-policy']) args.push('--approval-policy', opts['approval-policy'])
  for (const d of opts['add-dir'] ?? []) args.push('--add-dir', d)
  args.push('-')
  return new Promise((resolveRun, reject) => {
    const child = spawn(APP_EXE, args, { cwd, env: cliEnv(), stdio: ['pipe', 'pipe', 'pipe'] })
    let buf = ''; let final; let sid = sessionId; const texts = []; let err = ''
    const timer = setTimeout(() => { child.kill('SIGINT'); log('待機時間切れで CLI を中断しました') }, Number(opts.timeout ?? 30 * 60) * 1000)
    child.stdout.on('data', (c) => {
      buf += c
      let nl
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl); buf = buf.slice(nl + 1)
        let ev; try { ev = JSON.parse(line) } catch { continue }
        if (ev.type === 'session') { sid = ev.sessionId; log('セッション（cli）:', sid, ev.cwd) }
        else if (ev.type === 'text') texts.push(ev.text)
        else if (ev.type === 'final') final = ev
      }
    })
    child.stderr.on('data', (c) => { err += c })
    child.on('error', reject)
    child.on('close', (code) => {
      clearTimeout(timer)
      if (!final) { reject(new Error('CLI が結果を返さずに終了しました (exit ' + code + ')\n' + err.split('\n').filter(l => /^dsh:/u.test(l)).join('\n'))); return }
      const status = final.reason?.kind ?? 'unknown'
      out({ route: 'cli', sessionId: final.sessionId ?? sid, status, reason: final.reason, text: final.text ?? texts.join('') }, final.text ?? texts.join(''))
      if (status !== 'completed') { log('ターン終了理由:', JSON.stringify(final.reason)); process.exitCode = 4 }
      resolveRun()
    })
    child.stdin.end(prompt)
  })
}

// ---------- 共通 ----------
function chooseRoute() {
  const r = opts.route ?? 'auto'
  if (r === 'app' || r === 'cli') return r
  return appOrigin() ? 'app' : 'cli'
}

// アプリを前面に出さずに起動し、API が応答するまで待つ
async function launchApp() {
  log('DeepSeek Harness アプリをバックグラウンドで起動します')
  execFileSync('open', ['-g', '-j', '-a', APP])
  const deadline = Date.now() + 120000
  while (Date.now() < deadline) {
    await sleep(2000)
    if (!appOrigin()) continue
    try { appCtx = undefined; await api('session/list', { _request: {} }); return } catch {}
  }
  throw new Error('アプリを起動しましたが 120 秒以内に API が応答しませんでした')
}

// アプリ製セッション（agent preset 付き）は headless で再開できないため、必要ならアプリ経路へ切り替える
async function sendExisting(id, prompt) {
  const route = chooseRoute()
  if (route === 'app') return appRun(id, prompt)
  try {
    await cliRun(id, prompt, opts.cwd ? resolve(opts.cwd) : process.cwd())
  } catch (e) {
    if ((opts.route ?? 'auto') !== 'auto' || opts['no-launch'] || !/agent preset/u.test(String(e.message))) throw e
    log('このセッションはアプリ専用の構成のため、アプリ経由に切り替えます')
    await launchApp()
    await appRun(id, prompt)
  }
}

async function promptText(startIndex) {
  let text = pos.slice(startIndex).join(' ')
  if (!text || text === '-') { text = ''; for await (const c of process.stdin) text += c }
  if (!text.trim()) throw new Error('指示本文がありません（引数か標準入力で渡してください）')
  return text
}

function fsSessions(limit) {
  const root = join(DSH_HOME, 'sessions'); const rows = []
  for (const ws of readdirSync(root)) {
    let entries = []; try { entries = readdirSync(join(root, ws)) } catch { continue }
    for (const s of entries) if (s.startsWith('session-')) {
      try { rows.push({ sessionId: s, mtime: statSync(join(root, ws, s)).mtimeMs, workspaceKey: ws }) } catch {}
    }
  }
  return rows.sort((a, b) => b.mtime - a.mtime).slice(0, limit)
}

const HELP = 'dsh-worker <command>\n' +
  '  status                                   アプリ起動状況と使う経路\n' +
  '  list [件数]                              セッション一覧（アプリ未起動時は保存フォルダから）\n' +
  '  new --workspace-project <dir> [指示|-]  プロジェクトのグループ内で新規セッションを作り、指示する\n' +
  '  send <sessionId> [指示|-]                既存セッションへ指示し、結果を待つ\n' +
  '  start                                    アプリをバックグラウンド起動\n' +
  '  wait <sessionId>                         既存ターンの終了を待つ（app）\n' +
  '  read <sessionId> [件数]                  直近の会話（アプリ起動中のみ）\n' +
  '  cancel <sessionId>                       実行中のターンを中止（アプリ起動中のみ）\n' +
  '  models                                   選べるモデル一覧（アプリ起動中のみ）\n' +
  '         new の他の作成先: --workspace-default（app） | --cwd <dir>\n' +
  'options: --route auto|app|cli  --model provider/model  --steer  --no-wait  --timeout 秒  --json\n' +
  '         --permission-mode <preset>（app は new のみ / headless も可）\n' +
  '         --fail-on-question  --approval-policy ask|never  --add-dir <dir>（後二者は headless のみ）  --no-launch（アプリ自動起動をしない）'

try {
  if (Object.hasOwn(opts, 'permission-mode') && !/^[a-z][a-z0-9-]*$/u.test(opts['permission-mode'] ?? '')) {
    throw new Error('--permission-mode には有効なプリセット名を指定してください')
  }
  if (cmd === 'status') {
    const origin = appOrigin()
    out({ app: Boolean(origin), origin, route: origin ? 'app' : 'cli', cli: existsSync(APP_ASAR) },
      origin ? 'アプリ起動中: ' + origin + '（経路 app）' : 'アプリ未起動（経路 cli: dsh headless）')
  } else if (cmd === 'list') {
    const limit = Number(pos[0] ?? 20)
    if (appOrigin()) {
      const items = ((await api('session/list', { _request: {} })).items ?? []).slice(0, limit)
      if (opts.json) out(items.map(i => ({ sessionId: i.sessionId, running: i.running, title: i.projections?.values?.title, cwd: i.cwd })))
      else for (const i of items) console.log([i.sessionId, i.running ? '実行中' : '待機', i.projections?.values?.title ?? '', i.cwd ?? ''].join('\t'))
    } else {
      const rows = fsSessions(limit)
      if (opts.json) out(rows); else for (const r of rows) console.log([r.sessionId, new Date(r.mtime).toLocaleString('ja-JP'), r.workspaceKey].join('\t'))
    }
  } else if (cmd === 'new') {
    const workspaceDefault = Boolean(opts['workspace-default'])
    const workspaceProject = opts['workspace-project']
    if (workspaceDefault && workspaceProject) throw new Error('ワークスペースの指定は一つだけにしてください')
    if (!workspaceDefault && !workspaceProject && !opts.cwd) throw new Error('new には --workspace-default、--workspace-project <dir>、または --cwd <dir> が必要です')
    const prompt = await promptText(0)
    if (workspaceDefault || workspaceProject) {
      if (opts.route === 'cli') throw new Error('ワークスペースの指定には app 経路が必要です')
      if (!appOrigin()) {
        if (opts['no-launch']) throw new Error('アプリが起動していません')
        await launchApp()
      }
      const result = workspaceDefault
        ? await api('workspace/initializeDefault', {})
        : await api('workspace/create', { request: { path: resolve(workspaceProject) } })
      const workspace = result?.workspace
      if (!workspace?.workspaceId) throw new Error('ワークスペースを取得できませんでした')
      const created = await api('session/create', { request: { workspaceId: workspace.workspaceId, ...(opts.preset ? { agentPreset: opts.preset } : {}) } })
      log('新規セッション（app）:', created.sessionId, 'ワークスペース:', workspace.title)
      await appRun(created.sessionId, prompt)
    } else {
      const cwd = resolve(opts.cwd)
      if (chooseRoute() === 'app') {
        const created = await api('session/create', { request: { cwd, ...(opts.preset ? { agentPreset: opts.preset } : {}) } })
        log('新規セッション（app）:', created.sessionId)
        await appRun(created.sessionId, prompt)
      } else await cliRun(undefined, prompt, cwd)
    }
  } else if (cmd === 'send') {
    const id = normId(pos[0]); if (!id) throw new Error('send <sessionId> [指示]')
    const prompt = await promptText(1)
    await sendExisting(id, prompt)
  } else if (cmd === 'start') {
    if (appOrigin()) out({ app: true, origin: appOrigin() }, 'すでに起動しています: ' + appOrigin())
    else { await launchApp(); out({ app: true, origin: appOrigin() }, '起動しました: ' + appOrigin()) }
  } else if (cmd === 'wait') {
    const id = normId(pos[0]); if (!id) throw new Error('wait <sessionId>')
    const started = Date.now()
    for (;;) {
      const h = await history(id, 1000)
      const lastUser = h.findLastIndex(x => x.role === 'user')
      const after = lastUser >= 0 ? h.slice(lastUser + 1) : []
      const end = after.find(x => x.role === 'turn-end')
      if (end) {
        const status = end.reason?.kind ?? 'unknown'
        const text = after.filter(x => x.role === 'assistant' && x.text.trim()).map(x => x.text).join('\n\n')
        out({ route: 'app', sessionId: id, status, reason: end.reason, text }, text)
        if (status !== 'completed') process.exitCode = 4
        break
      }
      const row = await sessionRow(id)
      if (!row) throw new Error('セッションが見つかりません: ' + id)
      const pending = row?.projections?.values?.userQuestions?.active ?? []
      if (pending.length && opts['fail-on-question']) { out({ route: 'app', sessionId: id, status: 'awaiting-user', pending }); process.exitCode = 3; break }
      if (Date.now() - started > Number(opts.timeout ?? 1800) * 1000) { out({ route: 'app', sessionId: id, status: 'timeout' }); process.exitCode = 2; break }
      await sleep(3000)
    }
  } else if (cmd === 'read') {
    const h = await history(normId(pos[0]), Number(pos[1] ?? 6))
    if (opts.json) out(h)
    else for (const x of h) console.log(x.role === 'turn-end' ? '--- ターン終了 ' + JSON.stringify(x.reason) : '[' + x.role + ' #' + x.seq + ']\n' + x.text + '\n')
  } else if (cmd === 'cancel') {
    out(await api('session/cancel', { request: { sessionId: normId(pos[0]) } }), 'キャンセルを要求しました')
  } else if (cmd === 'models') {
    const cat = await api('session/modelCatalog', {})
    if (opts.json) out(cat)
    else for (const g of cat.providers ?? cat.groups ?? []) for (const m of g.models ?? []) console.log((g.provider ?? g.id) + '/' + (m.id ?? m.model ?? m.name))
    if (!opts.json && !(cat.providers ?? cat.groups)) console.log(JSON.stringify(cat, null, 2).slice(0, 4000))
  } else { console.log(HELP); process.exit(cmd ? 1 : 0) }
} catch (e) { console.error('[dsh-worker] エラー:', String(e.message ?? e)); process.exit(1) }

