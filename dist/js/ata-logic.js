import {normalize} from './utils.js';
const same=(a,b)=>normalize(a).trim()===normalize(b).trim();
export function migrateAtas(data){
  if(data.ataRelationsVersion)return;
  for(const row of data.requests){
    let ata=data.atas.find(a=>a.id===row.ataId||same(a.number,row.ata));
    if(!ata&&row.ata){ata={id:crypto.randomUUID(),number:row.ata,supplier:'Não informado',validity:'',description:'ATA recuperada de solicitação existente'};data.atas.push(ata)}
    if(ata)row.ataId=ata.id;
    const sector=data.sectors.find(s=>same(s.name,row.sector));if(sector)row.sectorId=sector.id;
    const product=data.products.find(p=>same(p.code,row.code));if(product)row.productId=product.id;
  }
  for(const ata of data.atas){
    const linked=data.requests.filter(r=>r.ataId===ata.id);
    ata.sectorIds=[...new Set([...(ata.sectorIds||[]),...linked.map(r=>r.sectorId).filter(Boolean)])];
    ata.productIds=[...new Set([...(ata.productIds||[]),...linked.map(r=>r.productId).filter(Boolean)])];
  }
  data.ataRelationsVersion=1;
}
export const atasForProduct=(data,id)=>data.atas.filter(a=>(a.productIds||[]).includes(id));
export function validateLinks(data,ataId,sectorIds,productIds){
  const ata=data.atas.find(a=>a.id===ataId);if(!ata)return;
  const removedSectors=(ata.sectorIds||[]).filter(id=>!sectorIds.includes(id));
  const removedProducts=(ata.productIds||[]).filter(id=>!productIds.includes(id));
  const active=data.requests.filter(r=>(r.ataId===ataId||(!r.ataId&&r.ata===ata.number))&&!['Concluída','Cancelada'].includes(r.status));
  if(active.some(r=>removedSectors.some(id=>r.sectorId===id||same(data.sectors.find(s=>s.id===id)?.name,r.sector))))throw Error('Há solicitações pendentes de um setor removido. Atenda ou cancele os itens antes de retirar sua participação na ATA.');
  if(active.some(r=>removedProducts.some(id=>r.productId===id||same(data.products.find(p=>p.id===id)?.code,r.code))))throw Error('Há solicitações pendentes de um produto removido. Atenda ou cancele os itens antes de retirar o produto da ATA.');
}
export function validateRequestLinks(data,ataId,sectorName,items){
  const ata=data.atas.find(a=>a.id===ataId);if(!ata)throw Error('Selecione uma ATA cadastrada.');
  const sector=data.sectors.find(s=>s.name===sectorName);
  if(!sector||!ata.sectorIds.includes(sector.id))throw Error('O setor selecionado não participa desta ATA.');
  for(const item of items){const product=data.products.find(p=>p.id===item.productId)||data.products.find(p=>same(p.code,item.code));if(!product||!ata.productIds.includes(product.id))throw Error(`O produto ${item.product} não está vinculado à ATA selecionada.`)}
  return {ata,sector};
}
