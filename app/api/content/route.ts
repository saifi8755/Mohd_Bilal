import {backend} from '@/lib/supabase';
import {isAdmin,readContent,json,sameOrigin} from '@/lib/server';
import {initial} from '@/lib/content';
export async function GET(){if(!await isAdmin())return json({error:'Sign in with the site owner account.'},403);return json(await readContent('draft'));}
function validate(value:any,shape:any,depth=0):boolean {
 if(depth>12)return false;
 if(Array.isArray(shape))return Array.isArray(value)&&value.length<=100&&value.every(x=>shape.length?validate(x,shape[0],depth+1):x&&typeof x==='object'&&['name','role','quote'].every(k=>typeof x[k]==='string'&&x[k].length<5000));
 if(shape&&typeof shape==='object')return value&&typeof value==='object'&&Object.keys(shape).every(k=>validate(value[k],shape[k],depth+1));
 if(typeof shape==='string')return typeof value==='string'&&value.length<=12000;
 return typeof value===typeof shape;
}
export async function POST(req:Request){
 if(!await isAdmin())return json({error:'Owner access required.'},403);
 if(!sameOrigin(req))return json({error:'Invalid request origin.'},403);
 if(Number(req.headers.get('content-length')||0)>1000000)return json({error:'Content is too large.'},413);
 let data:any;try{data=await req.json();}catch{return json({error:'Invalid content.'},400);}
 const {content,version,action}=data;if(!Number.isInteger(version)||version<0||!['save','publish'].includes(action)||!validate(content,initial)||JSON.stringify(content).length>600000)return json({error:'Please check your content fields.'},400);
 const allowed=new Set(initial.sections.map(s=>s.id));if(content.sections.length!==13||new Set(content.sections.map((s:any)=>s.id)).size!==13||content.sections.some((s:any)=>!allowed.has(s.id)))return json({error:'Keep all 13 section IDs unique; use visibility to hide sections.'},400);
 if(!/^#[0-9a-f]{6}$/i.test(content.theme.accent)||!/^#[0-9a-f]{6}$/i.test(content.theme.background)||!/^#[0-9a-f]{6}$/i.test(content.theme.text))return json({error:'Use six-digit hex colours.'},400);
 if(!['Michroma','Inter'].includes(content.theme.headingFont)||!['Inter','Arial'].includes(content.theme.bodyFont))return json({error:'Choose one of the supported fonts.'},400);
 if(content.projects.some((p:any)=>!/^[-a-z0-9]+$/.test(p.slug))||new Set(content.projects.map((p:any)=>p.slug)).size!==content.projects.length)return json({error:'Project slugs must be unique lowercase words with hyphens.'},400);
 if(content.services.some((s:any)=>!/^[-a-z0-9]+$/.test(s.slug))||new Set(content.services.map((s:any)=>s.slug)).size!==content.services.length)return json({error:'Service slugs must be unique lowercase words with hyphens.'},400);
 try{const saved=await backend('/rest/v1/rpc/save_portfolio',{method:'POST',body:JSON.stringify({payload:content,expected_version:version,publish_now:action==='publish'})});if(saved.conflict)return json({error:'Content changed in another session. Reload before saving.'},409);return json({ok:true,version:saved.version,action});}catch{return json({error:'Save failed. Check Supabase setup and try again.'},503);}
}
