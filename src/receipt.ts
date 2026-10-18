export type Receipt = {
  statusName?: string; status_name?: string; status?: string
  txExecutionResultName?: string
  last_round?: {round?:number|string;validator_votes_name?:string[];votes_revealed?:number|string;round_validators?:string[]}
  consensus_history?: {consensus_results?:{consensus_round?:string;status_changes?:string[]}[]}
  consensus_data?: {leader_receipt?: {execution_result?: string; result?: string | {status?: string;payload?:unknown}; genvm_result?: {error_code?: string; error_description?: string}}[]}
}
export function consensusUndetermined(receipt:Receipt){
 const status=String(receipt.statusName||receipt.status_name||receipt.status||'').toUpperCase()
 if(status==='UNDETERMINED')return true
 const round=receipt.consensus_history?.consensus_results?.at(-1)
 return status==='FINALIZED'&&(round?.consensus_round==='Undetermined'||!!round?.status_changes?.includes('UNDETERMINED'))
}
export function executionSucceeded(receipt: Receipt) {
  if(consensusUndetermined(receipt))return false
  if (receipt.txExecutionResultName) return receipt.txExecutionResultName === 'FINISHED_WITH_RETURN'
  return !!receipt.consensus_data?.leader_receipt?.some(item => item.execution_result === 'SUCCESS' && typeof item.result === 'object' && item.result?.status === 'return' && !item.genvm_result?.error_code)
}
export function executionFailure(receipt: Receipt) {
  if(consensusUndetermined(receipt))return 'Validators did not reach agreement This transaction did not establish a finalized result Check the report state before retrying'
  for (const item of receipt.consensus_data?.leader_receipt || []) {
    if (item.execution_result !== 'ERROR') continue
    if (typeof item.result === 'string') {
      try {
        const bytes = Uint8Array.from(atob(item.result), char => char.charCodeAt(0))
        // GenVM user-error payload: 0x01 followed by the UTF-8 reason
        if (bytes[0] === 1) return new TextDecoder().decode(bytes.slice(1)).replace(/[\u0000-\u001f]/g, ' ').slice(0, 400)
      } catch { /* Fall through to the structured execution error */ }
    }
    if(typeof item.result==='object'&&typeof item.result?.payload==='string')return item.result.payload.slice(0,400)
    if (item.genvm_result?.error_description) return item.genvm_result.error_description.slice(0,400)
  }
  return 'The transaction did not return successfully'
}
