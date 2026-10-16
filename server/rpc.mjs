import {AppError} from './validation.mjs'

const addressPattern=/^0x[0-9a-fA-F]{40}$/
const hashPattern=/^0x[0-9a-fA-F]{64}$/
const hexPattern=/^0x(?:[0-9a-fA-F]{2})*$/
const blockPattern=/^(?:latest|pending|0x[0-9a-fA-F]+)$/
const consensus='0xb7278a61aa25c888815afc32ad3cc52ff24fe575'

// Only fixed-network reads are relayed Signing and broadcasting stay in the wallet
export function validateRpc(payload,address){
 if(!payload||Array.isArray(payload)||payload.jsonrpc!=='2.0'||!Array.isArray(payload.params)||!['string','number'].includes(typeof payload.id)||String(payload.id).length>80)throw new AppError('Invalid RPC request',400)
 const p=payload.params,m=payload.method
 let valid=false
 if(m==='eth_chainId'||m==='eth_gasPrice')valid=p.length===0
 if(m==='eth_getTransactionCount')valid=p.length===2&&addressPattern.test(p[0])&&blockPattern.test(p[1])
 if(m==='eth_getTransactionByHash'||m==='eth_getTransactionReceipt')valid=p.length===1&&hashPattern.test(p[0])
 if(m==='gen_call'){
  const v=p[0]
  valid=p.length===1&&v?.type==='read'&&typeof v.to==='string'&&addressPattern.test(address)&&v.to.toLowerCase()===address.toLowerCase()&&addressPattern.test(v.from)&&hexPattern.test(v.data)&&v.data.length<=36000&&['latest-final','latest-nonfinal','latest','latest-accepted'].includes(v.transaction_hash_variant)&&Object.keys(v).every(k=>['type','to','from','data','transaction_hash_variant'].includes(k))
 }
 if(m==='eth_estimateGas'){
  const v=p[0]
  valid=p.length===1&&v&&typeof v.to==='string'&&v.to.toLowerCase()===consensus&&addressPattern.test(v.from)&&hexPattern.test(v.data)&&v.data.length<=36000&&(!v.value||/^0x0+$/.test(v.value))&&Object.keys(v).every(k=>['from','to','data','value'].includes(k))
 }
 if(!valid)throw new AppError('This RPC operation is not supported by the site relay',403)
 return {jsonrpc:'2.0',id:payload.id,method:m,params:p}
}

export async function relayRpc(payload,{endpoint,address,fetcher=fetch,timeout=12000,pause=ms=>new Promise(r=>setTimeout(r,ms))}){
 const request=validateRpc(payload,address)
 for(let attempt=0;attempt<2;attempt++){
  try{
   const response=await fetcher(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(request),redirect:'error',signal:AbortSignal.timeout(timeout)})
   if(response.status===429||response.status>=500)throw new Error('Upstream temporarily unavailable')
   if(!response.ok)throw new AppError('StudioNet rejected the RPC request',502)
   const raw=await response.text()
   if(raw.length>2000000)throw new AppError('StudioNet response exceeded the relay limit',502)
   let result;try{result=JSON.parse(raw)}catch{throw new Error('Invalid upstream response')}
   if(!result||Array.isArray(result)||!('result' in result||'error' in result))throw new Error('Invalid upstream response')
   // Contract errors are returned unchanged and never retried as connectivity errors
   return {jsonrpc:'2.0',id:request.id,...(result.error?{error:result.error}:{result:result.result})}
  }catch(e){if(e instanceof AppError)throw e;if(attempt===1)throw new AppError('StudioNet could not be reached through the site relay Your registered evidence is safe Try again shortly',503);await pause(350)}
 }
}
