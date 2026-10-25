export const site = {name:'O Refúgio', whatsapp:'', address:'', map:'', instagram:'', demo:true};
export function orderLink(name:string){return /^\d{10,15}$/.test(site.whatsapp)?`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Olá! Quero pedir: ${name}.`)}`:null}
