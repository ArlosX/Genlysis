import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {existsSync} from 'node:fs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
process.chdir(root);
if(Number(process.versions.node.split('.')[0])<24){console.error('Genlysis needs Node.js 24 or later. Current version: '+process.version);process.exit(1)}
if(!existsSync(path.join(root,'node_modules/vite/bin/vite.js'))){console.error('Dependencies are missing. In '+root+', run npm.cmd ci first.');process.exit(1)}
const web='http://127.0.0.1:5180/';
async function available(url,check){try{const r=await fetch(url,{signal:AbortSignal.timeout(1800)});return r.ok&&check(await r.text())}catch{return false}}
const [webReady,apiReady]=await Promise.all([available(web,t=>t.includes('<title>Genlysis</title>')),available('http://127.0.0.1:4181/api/health',t=>{try{return JSON.parse(t).status==='ok'}catch{return false}})]);
function open(){if(process.argv.includes('--open')&&process.platform==='win32'){const child=spawn('cmd.exe',['/c','start','',web],{windowsHide:true,stdio:'ignore'});child.on('error',()=>console.log('Open '+web+' in your browser.'))}}
if(webReady&&apiReady){console.log('Genlysis is already running: '+web);open();}
if(!webReady||!apiReady){
const children=[];let stopping=false;
function stop(code){if(stopping)return;stopping=true;for(const child of children)child.kill();process.exitCode=code;}
const commands=[];
if(!apiReady)commands.push(['--env-file-if-exists=.env','server/index.mjs']);
if(!webReady)commands.push(['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5180','--strictPort']);
for(const args of commands){const child=spawn(process.execPath,args,{cwd:root,stdio:'inherit'});children.push(child);child.on('error',error=>{console.error('Could not start Genlysis: '+error.message);stop(1)});child.on('exit',code=>stop(code||0));}
console.log('Genlysis project: '+root+'\nKeep this terminal open. Site: '+web);
if(process.argv.includes('--open')){let attempts=0;const timer=setInterval(async()=>{if(stopping||attempts++>25){clearInterval(timer);return}if(await available(web,t=>t.includes('<title>Genlysis</title>'))){clearInterval(timer);open()}},700);timer.unref()}
for(const sig of ['SIGINT','SIGTERM'])process.on(sig,()=>stop(0));
}
