type Manifest = Record<string, unknown>
type Entry = { id: string; parentId: string | null; manifest: Manifest }
type Dependencies = {
  load: (id: string) => Promise<Entry>
  read: (id: string) => Promise<Record<string, unknown>>
  write: (manifest: Manifest, parentId: string) => Promise<unknown>
  progress: (message: string) => void
}
const canonical = (value: unknown): string => {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']'
  if (value && typeof value === 'object') return '{' + Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k,v]) => JSON.stringify(k) + ':' + canonical(v)).join(',') + '}'
  return JSON.stringify(value)
}
function matches(record: Record<string, unknown>, entry: Entry) {
  let manifest: unknown
  try { manifest = JSON.parse(String(record.manifest)) } catch { throw new Error('The registered evidence cannot be read') }
  if (record.id !== entry.id || canonical(manifest) !== canonical(entry.manifest) || (record.parent_id || '') !== (entry.parentId || '')) {
    throw new Error('Registered evidence or revision history differs from this report')
  }
}

// Resolve the entire missing ancestry before asking the wallet for any writes
export async function registerRevisionChain(current: Entry, deps: Dependencies) {
  const missing: Entry[] = [], seen = new Set<string>()
  let entry = current
  while (true) {
    if (seen.has(entry.id) || seen.size >= 32) throw new Error('Revision history is cyclic or exceeds 32 reports')
    seen.add(entry.id)
    if (entry.manifest.id !== entry.id || entry.manifest.repository !== current.manifest.repository) throw new Error('Revision evidence does not match this repository')
    const record = await deps.read(entry.id)
    if (record.id) { matches(record, entry); break }
    missing.push(entry)
    if (!entry.parentId) break
    const parentId = entry.parentId
    entry = await deps.load(parentId)
    if (entry.id !== parentId) throw new Error('The previous report could not be resolved')
  }
  missing.reverse()
  for (const [index, item] of missing.entries()) {
    deps.progress(`Confirm evidence registration ${index + 1} of ${missing.length} in your wallet${item.id !== current.id ? ' — previous revision required first' : ''}`)
    // A previous attempt or another tab may already have finalized this entry
    const existing = await deps.read(item.id)
    if (existing.id) { matches(existing, item); continue }
    await deps.write(item.manifest, item.parentId || '')
    const finalRecord = await deps.read(item.id)
    if (!finalRecord.id) throw new Error('Registration returned but evidence is not in finalized state')
    matches(finalRecord, item)
  }
}
