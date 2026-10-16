import {waitUntil} from '@vercel/functions'
import {makeServer} from '../server/index.mjs'
import {createPostgresStore} from '../server/postgres.mjs'
let app
export default function handler(req,res){
 try{
  if(!app){const store=createPostgresStore(process.env.DATABASE_URL||process.env.POSTGRES_URL||process.env.STORAGE_URL);app=makeServer({store,background:waitUntil,distributedLimit:(key,max,seconds)=>store.limit(key,max,seconds)})}
  app.server.emit('request',req,res)
 }catch{
  res.statusCode=503;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:'The report database is not configured Connect Neon in Vercel Storage'}))
 }
}
