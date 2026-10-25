"use client";
import {useState} from 'react';import Link from 'next/link';import {detectLanguage,inspectCode,languages,type Language} from '@/lib/code-intelligence';
import {analyze} from '@/lib/checker';import {supabase} from '@/lib/supabase';
type Finding={name:string;severity:string;why:string;fix:string;category:string;line?:number};
export default function DeveloperIntelligence(){const[code,setCode]=useState(''),[language,setLanguage]=useState<Language>('html'),[override,setOverride]=useState(false),[findings,setFindings]=useState<Finding[]>([]),[score,setScore]=useState<number|null>(null),[coverage,setCoverage]=useState(''),[busy,setBusy]=useState(false),[fixed,setFixed]=useState(''),[notes,setNotes]=useState(''),[error,setError]=useState('');
function load(v:string,filename=''){setCode(v);if(!override)setLanguage(detectLanguage(v,filename));setFindings([]);setScore(null);setFixed('');setError('')}
function run(){try{setError('');setFixed('');if(!code.trim())return; if(language==='html'){const r=analyze(code);setFindings(r.issues.map(i=>({name:i.name,severity:i.severity,why:i.why,fix:i.fix,category:'Accessibility'})));setScore(r.score);setCoverage('HTML automated accessibility checks only; not WCAG certification')}else{const r=inspectCode(code,language);setFindings(r.issues);setScore(r.score);setCoverage(r.coverage)}}catch(e){setError(e instanceof Error?e.message:'Analysis failed')}}
async function generate(){
 if(!code.trim())return;
 setBusy(true);setError('');setFixed('');setNotes('');
 try{
  const db=supabase();
  if(!db)throw new Error('Supabase is not configured.');
  // A stalled Supabase session refresh used to leave the button loading
  // indefinitely without any request in the Network tab.
  const sessionResult=await Promise.race([
   db.auth.getSession(),
   new Promise<never>((_,reject)=>setTimeout(()=>reject(new Error('Session lookup timed out after 8 seconds. Please sign out and sign in again.')),8000))
  ]);
  if(sessionResult.error)throw new Error('Sign-in session error: '+sessionResult.error.message);
  const session=sessionResult.data.session;
  if(!session?.access_token)throw new Error('Please sign in again to generate AI fixes.');
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),55000);
  let response:Response;
  try{
   response=await fetch('/api/developer-fix',{
    method:'POST',
    headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`},
    body:JSON.stringify({code,language,issues:findings}),
    signal:controller.signal
   });
  }finally{clearTimeout(timer)}
  const data=await response.json().catch(()=>({error:'The server returned a non-JSON response.'}));
  if(!response.ok)throw new Error(`API ${response.status}: ${data.error||'Unable to generate fixes'}`);
  if(typeof data.code!=='string'||!data.code.trim())throw new Error('AI response did not contain corrected code.');
  setFixed(data.code);setNotes(data.explanation||'AI-proposed changes.');
 }catch(e){
  const message=e instanceof Error?e.message:'Unable to generate fixes';
  setError(message==='This operation was aborted'?'AI request exceeded 55 seconds. Check server logs.':message);
  console.error('[AccessAble AI] Generate AI fixes:',e);
 }finally{setBusy(false)}
}

return <div className="stack"><span className="eyebrow">DEVELOPER TOOLS / CODE INTELLIGENCE</span><h1>Understand your code. Improve it.</h1><p>Analyze supported issues, explore explanations and review AI-proposed fixes. Never paste credentials or secrets. Uploaded code is not executed.</p><div className="cols"><section className="card stack"><div className="row" style={{justifyContent:'space-between'}}><h2>Source code</h2><span className="pill">{language.toUpperCase()}</span></div><label htmlFor="code-language">Language</label><select id="code-language" value={language} onChange={e=>{setLanguage(e.target.value as Language);setOverride(true)}}>{languages.map(l=><option key={l} value={l}>{l.toUpperCase()}</option>)}</select><p style={{fontSize:13}}>Language is detected automatically when you paste or upload. Selecting a language overrides detection.</p><label htmlFor="code-editor">Paste code</label><textarea className="code-editor" id="code-editor" spellCheck={false} value={code} onChange={e=>load(e.target.value)} placeholder="Paste HTML, JavaScript, TypeScript, JSON, CSS or Python…"/><label htmlFor="code-file">Upload a source file</label><input id="code-file" type="file" accept=".html,.htm,.css,.js,.jsx,.ts,.tsx,.json,.py,.txt" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>100000){setError('File too large (100 KB maximum).');return}load(await file.text(),file.name)}}/><div className="row"><button className="btn" disabled={!code.trim()} onClick={run}>Analyze code</button><button className="btn ghost" onClick={()=>{setOverride(false);setLanguage(detectLanguage(code))}}>Auto-detect</button><button className="btn ghost" onClick={()=>load('')}>Clear</button><button className="btn ghost" disabled={!code} onClick={()=>void navigator.clipboard.writeText(code)}>Copy</button></div></section><section className="card stack" aria-live="polite"><h2>Code health overview</h2><div className="banner"><span className="eyebrow">Supported analysis score</span><h1>{score===null?'Not fully assessed':score+'/100'}</h1><p>{findings.length} findings · {coverage||'Run analysis to view supported checks'}</p></div>{findings.map((i,n)=><details className="issue" key={n}><summary>{i.name} <span className="pill">{i.severity}</span></summary><p><strong>{i.category}</strong>{i.line?' · Line '+i.line:''}</p><p>{i.why}</p><p><strong>Suggested fix:</strong> {i.fix}</p></details>)}{coverage&&findings.length===0&&<p>No issues detected by these limited checks. This does not mean the code is error-free.</p>}<button className="btn" disabled={!code.trim()||busy} onClick={()=>void generate()}>{busy?'Generating fixes…':'Generate AI fixes'}</button><p style={{fontSize:12}}>AI-proposed fixes are not compiler-verified. Review changes before production use.</p>{error&&<p role="alert" className="error">{error}</p>}</section></div>{fixed&&<section className="card stack"><h2>Review proposed corrections</h2><p>{notes}</p><div className="code-diff"><div><h3>Original</h3><pre>{code}</pre></div><div><h3>Proposed</h3><pre>{fixed}</pre></div></div><div className="row"><button className="btn" onClick={()=>void navigator.clipboard.writeText(fixed)}>Copy corrected code</button><button className="btn ghost" onClick={()=>{const blob=new Blob([fixed],{type:'text/plain'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='corrected.'+({
  html: 'html',
  css: 'css',
  javascript: 'js',
  typescript: 'ts',
  jsx: 'jsx',
  tsx: 'tsx',
  json: 'json',
  python: 'py'
} as Record<Language, string>)[language];a.click();URL.revokeObjectURL(url)}}>Download corrected code</button><button className="btn ghost" onClick={()=>{load(fixed);setTimeout(()=>{},0)}}>Accept and reanalyze</button><button className="btn ghost" onClick={()=>setFixed('')}>Reject</button></div></section>}</div>}
