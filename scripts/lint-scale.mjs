import {readdir,readFile} from 'node:fs/promises';
const errors=[];
async function scan(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=`${dir}/${e.name}`;if(e.isDirectory())await scan(p);else if(/\.(css|vue|ts)$/.test(p)){const s=await readFile(p,'utf8');s.split('\n').forEach((line,i)=>{for(const m of line.matchAll(/(-?\d+(?:\.\d+)?)px\b/g)){const n=Math.abs(Number(m[1]));if(n>2&&n%8!==0)errors.push(`${p}:${i+1}: ${m[0]}`)}if(/\btext-(xs|sm|base|lg|xl|\d+xl)\b|\b(?:p|m|gap)[xytrbl]?-[0-9]+\.5\b/.test(line))errors.push(`${p}:${i+1}: classe fora da escala`)})}}}
await scan('app');if(errors.length){console.error(errors.join('\n'));process.exit(1)}console.log('Escala de 8: verificada em todos os arquivos de app/.');
