import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {execFileSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {createClient} from 'genlayer-js'
import {studionet} from 'genlayer-js/chains'
import {TransactionHashVariant} from 'genlayer-js/types'

const address=process.argv[2]
if(!/^0x[0-9a-f]{40}$/i.test(address||''))throw Error('Provide the new deployed Genlysis contract address')
const filename='contracts/genlysis.py',local=readFileSync(filename)
const committed=execFileSync('git',['show','HEAD:'+filename])
if(!local.equals(committed))throw Error('Commit the exact reviewed source before recording deployment equivalence')
const client=createClient({chain:studionet,endpoint:process.env.GENLAYER_RPC_URL||'https://studio.genlayer.com/api'})
const source=await client.getContractCode(address)
const remote=typeof source==='string'?(source.startsWith('0x')?Buffer.from(source.slice(2),'hex'):Buffer.from(source)):Buffer.from(source)
const sha=b=>createHash('sha256').update(b).digest('hex')
if(!local.equals(remote))throw Error('Deployed source differs from the reviewed local source')
const normalize=v=>typeof v==='bigint'?v.toString():v instanceof Map?Object.fromEntries([...v].map(([k,x])=>[k,normalize(x)])):Array.isArray(v)?v.map(normalize):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,normalize(x)])):v
const protocol=normalize(await client.readContract({address,functionName:'get_protocol',args:[],transactionHashVariant:TransactionHashVariant.LATEST_FINAL}))
if(protocol.version!=='genlysis-v2'||protocol.assessment_version!=='semantic-evidence-v2')throw Error('Deployment protocol is not the corrected version')
const proof={verified_at:new Date().toISOString(),address,reviewed_commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),source_path:filename,source_sha256:sha(local),deployed_source_sha256:sha(remote),source_equal:true,protocol}
mkdirSync('artifacts',{recursive:true})
writeFileSync('artifacts/v2-deployment-equivalence.json',JSON.stringify(proof,null,2)+'\n')
console.log(JSON.stringify(proof,null,2))
