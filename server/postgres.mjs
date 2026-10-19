import pg from 'pg'
import {attachDatabasePool} from '@vercel/functions'
import {AppError} from './validation.mjs'

export function createPostgresStore(connection) {
 if (!connection) throw new Error('Connect Neon in Vercel Storage before deploying')
 const pool=new pg.Pool({connectionString:connection,max:3,connectionTimeoutMillis:10000,idleTimeoutMillis:5000,allowExitOnIdle:true})
 if(process.env.VERCEL)attachDatabasePool(pool)
 pool.on('error',error=>console.error('Genlysis database idle connection failed',{code:String(error?.code||'UNKNOWN')}))
 const sql=async(parts,...values)=>{
  const text=parts.reduce((query,part,index)=>query+(index?'$'+index:'')+part,'')
  return (await pool.query({text,values,query_timeout:15000})).rows
 }
 let initialization
 const initialize=()=>{
  if(initialization)return initialization
  const pending=(async()=>{
  await sql`CREATE TABLE IF NOT EXISTS genlysis_jobs (id TEXT PRIMARY KEY, state TEXT NOT NULL, stage TEXT NOT NULL, input JSONB NOT NULL, owner_hash TEXT NOT NULL, report JSONB, error TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`
  await sql`CREATE TABLE IF NOT EXISTS genlysis_rates (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at TIMESTAMPTZ NOT NULL)`
  })()
  initialization=pending
 // Requests surface setup errors without an unhandled background rejection
 pending.catch(error=>{initialization=undefined;console.error('Genlysis database initialization failed',{
  name:String(error?.name||'Error'),
  code:String(error?.code||'UNKNOWN'),
  transportCode:String(error?.sourceError?.cause?.code||error?.sourceError?.code||'UNKNOWN'),
  transportReason:String(error?.sourceError?.cause?.message||'').replace(/\b(?:postgres(?:ql)?|https?):\/\/[^\s]+/gi,'[redacted endpoint]').slice(0,300),
  message:String(error?.message||'Database initialization failed')
   .replace(/\b(?:postgres(?:ql)?|https?):\/\/[^\s]+/gi,'[redacted endpoint]')
   .replace(/\b(?:password|token|secret)\s*[=:]\s*[^\s,;]+/gi,'[redacted credential]')
   .slice(0,500)
 })})
  return pending
 }
 // Retry setup on a later request after a transient connection failure
 const ready={then(resolve,reject){return initialize().then(resolve,reject)}}
 return {
  ready,
  async create(id,input,hash){await ready;const [r]=await sql`INSERT INTO genlysis_jobs(id,state,stage,input,owner_hash) VALUES(${id},'queued','Queued',${JSON.stringify(input)}::jsonb,${hash}) RETURNING created_at`;return new Date(r.created_at).toISOString()},
  async get(id,privateFields=false){await ready;await sql`UPDATE genlysis_jobs SET state='failed',error='Collection exceeded its execution window Create a new analysis to retry' WHERE id=${id} AND state IN ('queued','running') AND created_at < NOW()-INTERVAL '5 minutes'`;const [r]=await sql`SELECT * FROM genlysis_jobs WHERE id=${id}`;if(!r)return null;return {id:r.id,state:r.state,stage:r.stage,input:r.input,report:r.report,error:r.error,createdAt:new Date(r.created_at).toISOString(),...(privateFields?{ownerHash:r.owner_hash}:{})}},
  async stage(id,stage){await ready;await sql`UPDATE genlysis_jobs SET state='running',stage=${stage} WHERE id=${id} AND state IN ('queued','running')`},
  async finish(id,report){await ready;await sql`UPDATE genlysis_jobs SET state='complete',stage='Report ready',report=${JSON.stringify(report)}::jsonb WHERE id=${id} AND state IN ('queued','running')`},
  async fail(id,error){await ready;await sql`UPDATE genlysis_jobs SET state='failed',error=${error} WHERE id=${id} AND state IN ('queued','running')`},
  async limit(key,max=8,seconds=3600){await ready;await sql`DELETE FROM genlysis_rates WHERE expires_at < NOW()-INTERVAL '1 hour'`;const [r]=await sql`INSERT INTO genlysis_rates(key,count,expires_at) VALUES(${key},1,NOW()+${seconds}*INTERVAL '1 second') ON CONFLICT(key) DO UPDATE SET count=CASE WHEN genlysis_rates.expires_at<=NOW() THEN 1 ELSE genlysis_rates.count+1 END, expires_at=CASE WHEN genlysis_rates.expires_at<=NOW() THEN NOW()+${seconds}*INTERVAL '1 second' ELSE genlysis_rates.expires_at END RETURNING count`;if(r.count>max)throw new AppError(key.startsWith('rpc:')?'RPC request limit reached Wait a minute before retrying':'Analysis limit reached Try again in an hour',429)},
  close(){return pool.end()}
 }
}
