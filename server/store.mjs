import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import path from 'node:path';
export function createStore(directory){mkdirSync(directory,{recursive:true});const db=new DatabaseSync(path.join(directory,'genlysis.sqlite'));db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY, state TEXT NOT NULL, stage TEXT NOT NULL, input TEXT NOT NULL, owner_hash TEXT NOT NULL, report TEXT, error TEXT, created_at TEXT NOT NULL); CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY, job_id TEXT NOT NULL REFERENCES jobs(id), stage TEXT NOT NULL, created_at TEXT NOT NULL);`);db.prepare("UPDATE jobs SET state='failed', error='The service restarted during collection. Create a new analysis to retry.' WHERE state IN ('queued','running')").run();return {
 create(id,input,hash){const now=new Date().toISOString();db.prepare('INSERT INTO jobs(id,state,stage,input,owner_hash,created_at) VALUES(?,?,?,?,?,?)').run(id,'queued','Queued',JSON.stringify(input),hash,now);return now},
 get(id,privateFields=false){const r=db.prepare('SELECT * FROM jobs WHERE id=?').get(id);if(!r)return null;return {id:r.id,state:r.state,stage:r.stage,input:JSON.parse(r.input),report:r.report?JSON.parse(r.report):null,error:r.error,createdAt:r.created_at,...(privateFields?{ownerHash:r.owner_hash}:{})}},
 stage(id,stage){const now=new Date().toISOString();db.prepare("UPDATE jobs SET state='running',stage=? WHERE id=?").run(stage,id);db.prepare('INSERT INTO events(job_id,stage,created_at) VALUES(?,?,?)').run(id,stage,now)},
 finish(id,report){db.prepare("UPDATE jobs SET state='complete',stage='Report ready',report=? WHERE id=?").run(JSON.stringify(report),id)},
 fail(id,error){db.prepare("UPDATE jobs SET state='failed',error=? WHERE id=?").run(error,id)},
 close(){db.close()}
}}
