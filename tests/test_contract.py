"""Contract invariant tests with explicit local GenVM doubles. Not live consensus."""
import copy
import hashlib
import importlib.util
import json
import pathlib
import sys
import types
import unittest

class UserError(Exception):
    pass
class Return:
    def __init__(self, value):
        self.calldata = value

gl = types.SimpleNamespace(Contract=object, public=types.SimpleNamespace(write=lambda f:f, view=lambda f:f),
    vm=types.SimpleNamespace(UserError=UserError, Return=Return),
    message=types.SimpleNamespace(sender_address=types.SimpleNamespace(as_hex='0x'+'1'*40)),
    message_raw={'datetime':'2026-10-16T12:00:00Z'})
module = types.ModuleType('genlayer')
module.gl = gl
module.TreeMap = dict
sys.modules['genlayer'] = module
spec = importlib.util.spec_from_file_location('genlysis_contract', pathlib.Path(__file__).resolve().parents[1]/'contracts'/'genlysis.py')
contract = importlib.util.module_from_spec(spec)
spec.loader.exec_module(contract)

TEXT = 'from genlayer import *\n# Evidence supports the precise source assessment requirement.\n'
SHA = 'a'*40
QUOTE = 'Evidence supports the precise source assessment requirement.'
def manifest(build_id='build-1'):
    return {'id':build_id,'repository':'https://github.com/owner/build','commit':SHA,'title':'A build',
        'profile':'developer-tools','purpose':'A useful project','genlayer_role':'Independent assessment',
        'rubric_version':contract.RUBRIC,'sources':[{'path':'contracts/app.py','role':'contract',
        'url':f'https://raw.githubusercontent.com/owner/build/{SHA}/contracts/app.py',
        'sha256':hashlib.sha256(TEXT.encode()).hexdigest()}]}

class ContractTests(unittest.TestCase):
    def setUp(self):
        gl.message.sender_address.as_hex='0x'+'1'*40
        self.c=contract.Genlysis()
        self.response=types.SimpleNamespace(status_code=200,body=TEXT.encode())
        self.model={a:{'status':'PASS','source_path':'contracts/app.py','quote':QUOTE,'start_line':2,'end_line':2,
            'reason':'The supplied scope supports this criterion.','action':'Retain the committed evidence.',
            'verify':'Repeat the documented assessment.'} for a in contract.AXES}
        gl.nondet=types.SimpleNamespace(web=types.SimpleNamespace(request=lambda *a,**kw:self.response),
            exec_prompt=lambda *a,**kw:({'supported':True,'compatible':True} if 'Validate source-evidence support' in a[0] else copy.deepcopy(self.model)))
        def nondet(assess,validate):
            result=assess()
            if not validate(Return(copy.deepcopy(result))):
                raise UserError('No agreement')
            return result
        gl.vm.run_nondet_unsafe=nondet
    def register(self,m=None,parent=''):
        self.c.register_build(json.dumps(m or manifest()),parent)
    def result(self):
        return self.c.get_assessment('0x'+'1'*40,'build-1')
    def assess(self):
        self.c.assess_build('0x'+'1'*40,'build-1')
    def test_fixed_protocol(self):
        self.assertEqual(self.c.get_protocol()['rubric_version'],contract.RUBRIC)
    def test_duplicate_rejected(self):
        self.register()
        with self.assertRaises(UserError):self.register()
    def test_wallet_namespace_prevents_reservation_attack(self):
        self.register()
        gl.message.sender_address.as_hex='0x'+'2'*40
        self.register()
        self.assertEqual(len(self.c.builds),2)
    def test_wrong_rubric_denied(self):
        m=manifest();m['rubric_version']='attacker-v2'
        with self.assertRaises(UserError):self.register(m)
    def test_mutable_branch_denied(self):
        m=manifest();m['sources'][0]['url']=m['sources'][0]['url'].replace(SHA,'main')
        with self.assertRaises(UserError):self.register(m)
    def test_foreign_repo_denied(self):
        m=manifest();m['sources'][0]['url']=m['sources'][0]['url'].replace('/owner/','/attacker/')
        with self.assertRaises(UserError):self.register(m)
    def test_wrong_commit_denied(self):
        m=manifest();m['sources'][0]['url']=m['sources'][0]['url'].replace(SHA,'b'*40)
        with self.assertRaises(UserError):self.register(m)
    def test_path_traversal_denied(self):
        m=manifest();m['sources'][0]['url']=m['sources'][0]['url'].replace('contracts/app.py','../app.py')
        with self.assertRaises(UserError):self.register(m)
    def test_duplicate_sources_denied(self):
        m=manifest();m['sources'].append(copy.deepcopy(m['sources'][0]))
        with self.assertRaises(UserError):self.register(m)
    def test_bad_digest_denied(self):
        m=manifest();m['sources'][0]['sha256']='0'*63
        with self.assertRaises(UserError):self.register(m)
    def test_path_binding(self):
        m=manifest();m['sources'][0]['path']='README.md'
        with self.assertRaises(UserError):self.register(m)
    def test_foreign_revision_denied(self):
        self.register();gl.message.sender_address.as_hex='0x'+'2'*40
        with self.assertRaises(UserError):self.register(manifest('build-2'),'build-1')
    def test_revision_preserves_history(self):
        self.register();self.register(manifest('build-2'),'build-1')
        self.assertEqual(len(self.c.builds),2)
    def test_third_party_review_denied(self):
        self.register();gl.message.sender_address.as_hex='0x'+'2'*40
        with self.assertRaises(UserError):self.assess()
    def test_full_assessment_with_independent_agreement(self):
        self.register();self.assess()
        self.assertEqual(self.result()['score'],80)
        self.assertEqual(self.result()['readiness'],'NEEDS_WORK')
    def test_forged_quote_becomes_unknown(self):
        self.model['integration']['quote']='An invented source excerpt that never occurred.'
        self.register();self.assess()
        self.assertEqual(self.result()['criteria']['integration']['status'],'UNKNOWN')
        self.assertEqual(self.result()['coverage'],75)
        self.assertEqual(self.result()['readiness'],'EVIDENCE_GAP')
    def test_fail_prevents_readiness(self):
        self.model['fit']['status']='FAIL';self.register();self.assess()
        self.assertEqual(self.result()['readiness'],'NEEDS_WORK')
    def test_partial_is_half_weight(self):
        self.model['fit']['status']='PARTIAL';self.register();self.assess()
        self.assertEqual(self.result()['score'],67)
    def test_changed_bytes_produce_no_result(self):
        self.response.body=TEXT.encode()+b'\n';self.register()
        with self.assertRaises(UserError):self.assess()
        self.assertFalse(self.result())
    def test_unavailable_source_produces_no_result(self):
        self.response.status_code=404;self.register()
        with self.assertRaises(UserError):self.assess()
        self.assertFalse(self.result())
    def test_disagreement_produces_no_result(self):
        self.register()
        def no_agreement(assess,validate):
            result=assess();result['fit']['status']='FAIL'
            if not validate(Return(result)):raise UserError('No agreement')
            return result
        gl.vm.run_nondet_unsafe=no_agreement
        with self.assertRaises(UserError):self.assess()
        self.assertFalse(self.result())
    def test_cannot_overwrite_assessment(self):
        self.register();self.assess()
        with self.assertRaises(UserError):self.assess()
    def test_unknown_model_enum_is_not_pass(self):
        self.model['fit']['status']='APPROVE';self.register();self.assess()
        self.assertEqual(self.result()['criteria']['fit']['status'],'UNKNOWN')

if __name__=='__main__':unittest.main()
