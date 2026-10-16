export type Receipt = {
  statusName?: string; status_name?: string; status?: string
  txExecutionResultName?: string
  consensus_data?: {leader_receipt?: {execution_result?: string; result?: string | {status?: string}; genvm_result?: {error_code?: string; error_description?: string}}[]}
}
export function executionSucceeded(receipt: Receipt) {
  if (receipt.txExecutionResultName) return receipt.txExecutionResultName === 'FINISHED_WITH_RETURN'
  return !!receipt.consensus_data?.leader_receipt?.some(item => item.execution_result === 'SUCCESS' && typeof item.result === 'object' && item.result?.status === 'return' && !item.genvm_result?.error_code)
}
export function executionFailure(receipt: Receipt) {
  for (const item of receipt.consensus_data?.leader_receipt || []) {
    if (item.execution_result !== 'ERROR') continue
    if (typeof item.result === 'string') {
      try {
        const bytes = Uint8Array.from(atob(item.result), char => char.charCodeAt(0))
        // GenVM user-error payload: 0x01 followed by the UTF-8 reason
        if (bytes[0] === 1) return new TextDecoder().decode(bytes.slice(1)).replace(/[\u0000-\u001f]/g, ' ').slice(0, 400)
      } catch { /* Fall through to the structured execution error */ }
    }
    if (item.genvm_result?.error_description) return item.genvm_result.error_description.slice(0,400)
  }
  return 'The transaction did not return successfully'
}
