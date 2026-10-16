import {executionSucceeded,executionFailure,type Receipt} from './receipt'
import type {CalldataEncodable} from 'genlayer-js/types'
import {TransactionHashVariant} from 'genlayer-js/types'
import type {Config} from './types'
interface Provider{request(args:{method:string;params?:unknown[]}):Promise<unknown>}
declare global{interface Window{ethereum?:Provider}}
export const addressValid=(a:string)=>/^0x[0-9a-fA-F]{40}$/.test(a)
const normalize=(v:unknown):unknown=>v instanceof Map?Object.fromEntries([...v].map(([k,x])=>[String(k),normalize(x)])):Array.isArray(v)?v.map(normalize):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,normalize(x)])):v
export async function connect(config:Config){const p=window.ethereum;if(!p)throw new Error('Install an EVM wallet to request consensus Technical preflight works without a wallet');await p.request({method:'eth_requestAccounts'});const chain='0xf22f';const current=String(await p.request({method:'eth_chainId'}));if(current.toLowerCase()!==chain){try{await p.request({method:'wallet_switchEthereumChain',params:[{chainId:chain}]})}catch(e){if((e as {code?:number}).code!==4902)throw e;await p.request({method:'wallet_addEthereumChain',params:[{chainId:chain,chainName:'GenLayer StudioNet',nativeCurrency:{name:'GEN',symbol:'GEN',decimals:18},rpcUrls:[config.rpc]}]});await p.request({method:'wallet_switchEthereumChain',params:[{chainId:chain}]})}}if(String(await p.request({method:'eth_chainId'})).toLowerCase()!==chain)throw new Error('Switch to StudioNet before continuing');const accounts=await p.request({method:'eth_accounts'}) as string[];if(!addressValid(accounts[0]||''))throw new Error('Select a valid wallet account');return accounts[0]}
export async function chainClient(config:Config,account:string,progress:(message:string)=>void=()=>{}){if(!addressValid(config.contractAddress||''))throw new Error('The Genlysis contract is awaiting deployment');const [{createClient},{studionet}]=await Promise.all([import('genlayer-js'),import('genlayer-js/chains')]);const endpoint=config.rpcRelay?new URL(config.rpcRelay,location.origin).href:config.rpc;const provider:Provider={async request(request){if(request.method==='eth_sendTransaction'){progress('Confirm the transaction in your wallet');try{return await window.ethereum!.request(request)}catch(e){if(/failed to fetch|network|timeout/i.test(String((e as Error)?.message||e)))throw new Error('Your wallet could not reach StudioNet No transaction hash was returned Check wallet activity before retrying');throw e}}return window.ethereum!.request(request)}};const client=createClient({chain:{...studionet,rpcUrls:{...studionet.rpcUrls,default:{http:[endpoint]}}},endpoint,provider,account:account as `0x${string}`}),address=config.contractAddress as `0x${string}`;return {
 async read(fn:string,args:CalldataEncodable[]=[]){return normalize(await client.readContract({address,functionName:fn,args,transactionHashVariant:TransactionHashVariant.LATEST_FINAL})) as Record<string,unknown>},
 async wait(hash:string){return wait(hash)},
 async write(fn:string,args:CalldataEncodable[],submitted:(hash:string)=>void){progress('Preparing transaction');const hash=String(await client.writeContract({address,functionName:fn,args,value:0n}));submitted(hash);await wait(hash);return hash}
};
 async function wait(hash:string){
  for(let attempt=0;attempt<120;attempt++){
   let r:Receipt;
   try{r=await client.getTransaction({hash:hash as Parameters<typeof client.getTransaction>[0]["hash"]}) as unknown as Receipt}
   catch{progress('Connection interrupted Retrying the status check No new transaction is being sent');await new Promise(resolve=>setTimeout(resolve,5000));continue}
   const status=String(r.statusName||r.status_name||r.status||'PENDING').toUpperCase();
   progress('StudioNet status: '+status+' | Checked '+new Date().toLocaleTimeString());
   if(status==='FINALIZED'){if(!executionSucceeded(r))throw Object.assign(new Error(executionFailure(r)+' ('+status+') Transaction: '+hash),{terminal:true});return hash}
   if(['CANCELED','CANCELLED','UNDETERMINED'].includes(status))throw Object.assign(new Error('StudioNet ended the transaction with status '+status+' Transaction: '+hash),{terminal:true});
   await new Promise(resolve=>setTimeout(resolve,5000));
  }
  throw new Error('Confirmation is taking longer than expected Your transaction hash is saved Use Check saved transaction to continue without sending again')
 }
}
