import test from 'node:test'
import assert from 'node:assert/strict'
import {relayRpc,validateRpc} from '../server/rpc.mjs'
import {makeServer} from '../server/index.mjs'
import {once} from 'node:events'
const address='0x4BD95131706b77a8100ee38a634a797bE7928715',sender='0x04eB0c501Adcf053901E2910862C89803E7b5552'
const request={jsonrpc:'2.0',id:1,method:'gen_call',params:[{type:'read',to:address,from:sender,data:'0x1234',transaction_hash_variant:'latest-final'}]}
test('relay rejects signing, broadcast, state simulation and arbitrary contract reads',()=>{
 for(const method of ['eth_sendTransaction','eth_sendRawTransaction','personal_sign','sim_fundAccount','gen_getContractSchemaForCode'])assert.throws(()=>validateRpc({...request,method},address),/not supported/)
 assert.throws(()=>validateRpc({...request,params:[{...request.params[0],type:'write'}]},address),/not supported/)
 assert.throws(()=>validateRpc({...request,params:[{...request.params[0],to:sender}]},address),/not supported/)
 assert.throws(()=>validateRpc([request],address),/Invalid/)
 assert.deepEqual(validateRpc(request,address),request)
})
test('relay retries transient read failures against fixed upstream and preserves contract errors',async()=>{
 let calls=0
 const result=await relayRpc(request,{address,endpoint:'https://studio.genlayer.com/api',pause:async()=>{},fetcher:async(url,options)=>{assert.equal(url,'https://studio.genlayer.com/api');assert.equal(options.redirect,'error');assert.equal(JSON.parse(options.body).params[0].type,'read');if(++calls===1)throw new TypeError('Failed to fetch');return new Response(JSON.stringify({jsonrpc:'2.0',id:1,result:'0x1234'}))}})
 assert.equal(calls,2);assert.equal(result.result,'0x1234')
 calls=0
 const error={code:-32000,message:'Contract rejected the request'}
 assert.deepEqual((await relayRpc(request,{address,endpoint:'https://studio.genlayer.com/api',fetcher:async()=>{calls++;return new Response(JSON.stringify({error}))}})).error,error)
 assert.equal(calls,1)
 await assert.rejects(relayRpc(request,{address,endpoint:'https://studio.genlayer.com/api',pause:async()=>{},fetcher:async()=>{throw Error('Network failure')}}),e=>e.status===503)
})
test('HTTP relay enforces origin and independent quota and passes read result',async()=>{
 const quota=[];let calls=0
 const {server}=makeServer({store:{close(){}},distributedLimit:async(...args)=>quota.push(args),fetcher:async()=>{calls++;return new Response(JSON.stringify({result:'0xf22f'}))}})
 server.listen(0,'127.0.0.1');await once(server,'listening');const base='http://127.0.0.1:'+server.address().port
 const post=(payload,origin=base)=>fetch(base+'/api/rpc',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(payload)})
 try{
  const good=await post({jsonrpc:'2.0',id:2,method:'eth_chainId',params:[]});assert.equal(good.status,200);assert.equal((await good.json()).result,'0xf22f')
  assert.equal(quota[0][1],180);assert.equal(quota[0][2],60);assert.match(quota[0][0],/^rpc:/)
  assert.equal((await post({jsonrpc:'2.0',id:3,method:'eth_sendTransaction',params:[]})).status,403)
  assert.equal((await post({jsonrpc:'2.0',id:3,method:'eth_chainId',params:[]},'https://evil.invalid')).status,403)
  assert.equal(calls,1)
 }finally{server.close();await once(server,'close')}
})
