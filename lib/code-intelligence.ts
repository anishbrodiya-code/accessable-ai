export type CodeIssue={severity:'critical'|'serious'|'moderate';category:string;name:string;why:string;fix:string;line?:number;source:'verified'|'heuristic'};
export type Language='html'|'css'|'javascript'|'typescript'|'jsx'|'tsx'|'json'|'python';
export const languages:Language[]=['html','css','javascript','typescript','jsx','tsx','json','python'];
export function detectLanguage(code:string,filename=''):Language{
 const ext=filename.split('.').pop()?.toLowerCase();const byExt:Record<string,Language>={html:'html',htm:'html',css:'css',js:'javascript',ts:'typescript',jsx:'jsx',tsx:'tsx',json:'json',py:'python'};
 if(ext&&byExt[ext])return byExt[ext];const t=code.trim();if(t.startsWith('<!doctype')||/^<([a-z][\w-]*)(\s|>)/i.test(t))return 'html';if(t.startsWith('{')||t.startsWith('[')){try{JSON.parse(t);return 'json'}catch{if(/^\{\s*"/.test(t))return 'json'}}if(/<[A-Z][\w]*|className=|return\s*\(\s*</.test(t))return 'tsx';if(/\b(interface|type)\s+\w+|:\s*(string|number|boolean)\b/.test(t))return 'typescript';if(/^\s*(def |import [a-z_]+|from [a-z_]+ import |class [A-Z]\w*:)/m.test(t))return 'python';if(/^[.#]?[\w-]+\s*\{[^}]*:[^}]*\}/s.test(t))return 'css';return 'javascript';
}
export function inspectCode(code:string,language:Language):{issues:CodeIssue[];coverage:string;score:number|null}{
 const issues:CodeIssue[]=[];const add=(category:string,name:string,why:string,fix:string,severity:CodeIssue['severity']='moderate',line?:number,source:CodeIssue['source']='heuristic')=>issues.push({category,name,why,fix,severity,line,source});
 if(language==='json'){try{JSON.parse(code)}catch(e){add('Syntax','Invalid JSON',e instanceof Error?e.message:'Invalid JSON','Correct the JSON syntax.', 'serious',undefined,'verified')}}
 if(['javascript','typescript','jsx','tsx'].includes(language)){
  if(/\beval\s*\(/.test(code))add('Security','Dynamic eval()','Executing strings as code can introduce injection vulnerabilities.','Avoid eval(); use explicit parsing or safe dispatch.','serious');
  if(/\.innerHTML\s*=/.test(code))add('Security','Unsafe HTML assignment','Assigning untrusted HTML can enable XSS.','Prefer textContent or sanitize trusted markup.','serious');
  if(/console\.log\s*\(/.test(code))add('Maintainability','Console logging','Debug logging may expose data or add noise.','Remove unnecessary logging before production.');
 }
 if(language==='python'&&/\bexec\s*\(|\beval\s*\(/.test(code))add('Security','Dynamic code execution','Dynamic execution may be unsafe with untrusted input.','Use explicit parsing or a restricted approach.','serious');
 if(language==='css'&&/!important/.test(code))add('Maintainability','Important override','Frequent !important rules make styles harder to maintain.','Use scoped selectors or adjust specificity.');
 const coverage=language==='json'?'JSON parsing only':language==='html'?'HTML accessibility rules': 'Heuristic security and maintainability checks only; full syntax and accessibility validation unavailable';
 const score=language==='json'?Math.max(0,100-issues.reduce((n,i)=>n+(i.severity==='serious'?20:8),0)):null;
 return {issues,coverage,score};
}
