
import {isAdmin,json,sameOrigin} from '@/lib/server';
export async function POST(req:Request){
 if(!await isAdmin()||!sameOrigin(req))return json({error:'Owner access required.'},403);
 if(Number(req.headers.get('content-length')||0)>4*1024*1024)return json({error:'Choose a file under 3 MB.'},413);
 const form=await req.formData();const f=form.get('file');if(!(f instanceof File)||f.size>3*1024*1024)return json({error:'Choose an image or PDF under 3 MB.'},400);
 const types:Record<string,string>={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/avif':'avif','application/pdf':'pdf'};
 if(!types[f.type])return json({error:'Use JPG, PNG, WebP, AVIF or PDF.'},400);
 const bytes=new Uint8Array(await f.arrayBuffer());const valid=f.type==='application/pdf'?String.fromCharCode(...bytes.slice(0,5))==='%PDF-':f.type==='image/jpeg'?bytes[0]===255&&bytes[1]===216:f.type==='image/png'?bytes[0]===137&&bytes[1]===80:f.type==='image/webp'?String.fromCharCode(...bytes.slice(8,12))==='WEBP':String.fromCharCode(...bytes.slice(4,8))==='ftyp';
 if(!valid)return json({error:'File content does not match its type.'},400);
 const key=crypto.randomUUID()+'.'+types[f.type];const r=await fetch(process.env.SUPABASE_URL+'/storage/v1/object/portfolio/'+key,{method:'POST',headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY!,Authorization:'Bearer '+process.env.SUPABASE_SERVICE_ROLE_KEY!,'Content-Type':f.type},body:bytes});if(!r.ok)return json({error:'Upload failed. Check the private portfolio bucket setup.'},503);return json({url:'/media/'+key});
}
