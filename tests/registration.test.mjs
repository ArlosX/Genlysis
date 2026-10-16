import test from 'node:test'
import assert from 'node:assert/strict'
import {registerRevisionChain} from '../src/registration.ts'
import {executionFailure,executionSucceeded} from '../src/receipt.ts'
const make=(id,parentId=null)=>({id,parentId,manifest:{id,repository:'https://github.com/ArlosX/PatchJury',sources:[{sha256:'fixed'}]}})
const parent=make('parent'),child=make('child','parent')
function harness(){const records=new Map(),writes=[];return {records,writes,deps:{load:async id=>{assert.equal(id,'parent');return parent},read:async id=>records.get(id)||{},write:async(m,p)=>{if(p)assert.ok(records.has(p),'parent must already be finalized');writes.push(m.id);records.set(m.id,{id:m.id,manifest:JSON.stringify(m),parent_id:p})},progress:()=>{}}}}
test('first onchain assessment of a local revision registers parent before child',async()=>{const h=harness();await registerRevisionChain(child,h.deps);assert.deepEqual(h.writes,['parent','child'])})
test('retry resumes after parent registration without a duplicate write',async()=>{const h=harness();const write=h.deps.write;h.deps.write=async(m,p)=>{if(m.id==='child')throw Error('Wallet rejected');return write(m,p)};await assert.rejects(registerRevisionChain(child,h.deps),/Wallet rejected/);h.deps.write=write;await registerRevisionChain(child,h.deps);assert.deepEqual(h.writes,['parent','child'])})
test('same commit with substituted evidence cannot reuse an existing record',async()=>{const h=harness();h.records.set('child',{id:'child',manifest:JSON.stringify({...child.manifest,sources:[]}),parent_id:'parent'});await assert.rejects(registerRevisionChain(child,h.deps),/differs/);assert.equal(h.writes.length,0)})
test('missing or cyclic history fails before sending a transaction',async()=>{const h=harness();h.deps.load=async id=>id==='parent'?make('parent','child'):child;await assert.rejects(registerRevisionChain(child,h.deps),/cyclic/);assert.equal(h.writes.length,0)})
test('successful receipt without final state is not accepted as registered',async()=>{const h=harness();h.deps.write=async()=>{};await assert.rejects(registerRevisionChain(parent,h.deps),/not in finalized state/)})
test('actual finalized GenVM revert exposes its cause and is never success',()=>{const r={status:'FINALIZED',consensus_data:{leader_receipt:[{execution_result:'ERROR',result:'AVJldmlzaW9uIHBhcmVudCBtdXN0IGJlIHlvdXIgYnVpbGQgaW4gdGhlIHNhbWUgcmVwb3NpdG9yeQ=='}]}};assert.equal(executionSucceeded(r),false);assert.equal(executionFailure(r),'Revision parent must be your build in the same repository')})
