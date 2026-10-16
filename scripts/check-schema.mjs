import {readFile} from 'node:fs/promises';
import {createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
try{const source=await readFile('contracts/genlysis.py','utf8'),client=createClient({chain:studionet,endpoint:process.env.GENLAYER_RPC_URL||'https://studio.genlayer.com/api'});const schema=await client.getContractSchemaForCode(source);const methods=Object.keys(schema?.methods||{});for(const m of ['register_build','assess_build','get_build','get_assessment','get_protocol'])if(!methods.includes(m))throw new Error('Missing schema method '+m);console.log('Genlysis schema valid:',methods.join(', '));}catch(e){console.error(e instanceof Error?e.message:String(e));process.exitCode=1;}
