import {Store} from './store.js';
import {open,close,edit as simpleEdit} from './modals.js';
import {escape as esc,toast} from './utils.js';
import {atasForProduct,validateLinks} from './ata-logic.js';
import {mountPicker} from './picker.js';
import {mountAtaItems} from './ata-items.js';
const field=(name,label,value='',type='text')=>`<label class="field">${label}<input name="${name}" type="${type}" value="${esc(value)}" required maxlength="250" data-testid="field-${name}"></label>`;
export function registrationEditor(type,record,onSave){
  if(!['atas','products'].includes(type))return simpleEdit(type,record,onSave);
  const row=record||{},isAta=type==='atas';
  const sectorIds=new Set(row.sectorIds||[]),productIds=new Set(row.productIds||[]),ataIds=new Set(atasForProduct(Store.data,row.id).map(a=>a.id));
  open(`${record?'Editar':isAta?'Nova':'Novo'} ${isAta?'ATA de registro de preços':'produto'}`,`<form id="registration-form"><div class="modal-body"><p>${isAta?'Cadastre os dados da ATA e escolha os setores participantes e os produtos disponíveis.':'Cadastre o material e selecione as ATAs nas quais ele está disponível.'}</p><section class="form-grid registration-meta">${isAta?field('number','Número da ATA',row.number)+field('validity','Vigência até',row.validity,'date')+field('supplier','Fornecedor',row.supplier)+field('description','Descrição',row.description):field('code','Código do produto',row.code)+field('unit','Unidade de medida',row.unit)+field('product','Nome do produto',row.product)}</section>${isAta?`<div class="registration-columns"><section class="editor-section"><h3>Setores participantes</h3><p>Uma ATA pode atender vários setores.</p><div id="sector-picker"></div></section><section class="editor-section"><h3>Produtos desta ATA</h3><p>Busque, selecione e insira os produtos.</p><div id="product-picker"></div></section></div>`:`<section class="editor-section"><h3>ATAs deste produto</h3><p>O mesmo produto pode participar de mais de uma ATA.</p><div id="ata-picker"></div></section>`}<p id="registration-error" role="alert" class="form-error"></p></div><div class="modal-footer"><button class="btn" type="button" data-close>Cancelar</button><button class="btn primary" type="submit" data-testid="save-record">Salvar ${isAta?'ATA':'produto'}</button></div></form>`);
  document.getElementById('modal').classList.add('workspace-dialog');
  let ataItems;
  if(isAta){mountPicker(document.getElementById('sector-picker'),{id:'ata-sectors',rows:Store.data.sectors,selected:sectorIds,label:'setores',detail:r=>r.responsible||'',pageSize:5,onChange:()=>ataItems?.render()});ataItems=mountAtaItems(document.getElementById('product-picker'),{row,sectorIds,productIds});document.getElementById('modal').classList.add('ata-editor-dialog')}else mountPicker(document.getElementById('ata-picker'),{id:'product-atas',rows:Store.data.atas,selected:ataIds,label:'ATAs',detail:r=>r.supplier||'',pageSize:5});
  document.getElementById('registration-form').onsubmit=e=>{e.preventDefault();const values=Object.fromEntries(new FormData(e.target));for(const key in values)values[key]=values[key].trim();const fail=msg=>document.getElementById('registration-error').textContent=msg;
    if(Object.values(values).some(v=>!v))return fail('Preencha os dados obrigatórios.');
    const unique=isAta?'number':'code';if(Store.data[type].some(r=>r.id!==row.id&&r[unique].toLocaleLowerCase()===values[unique].toLocaleLowerCase()))return fail('Já existe um cadastro com esse identificador.');
    if(isAta&&!sectorIds.size)return fail('Selecione pelo menos um setor participante.');
    if(!isAta&&!ataIds.size)return fail('Vincule o produto a pelo menos uma ATA. Cadastre a ATA primeiro, se necessário.');
    let sectorQuantities;try{if(isAta)sectorQuantities=ataItems.values()}catch(err){return fail(err.message)}
    const id=row.id||crypto.randomUUID();
    try{if(isAta)validateLinks(Store.data,id,[...sectorIds],[...productIds]);else for(const ata of Store.data.atas){const links=(ata.productIds||[]).filter(pid=>pid!==id);if(ataIds.has(ata.id))links.push(id);validateLinks(Store.data,ata.id,ata.sectorIds||[],links)}}catch(err){return fail(err.message)}
    const updated={...row,...values,id,...(isAta?{sectorIds:[...sectorIds],productIds:[...productIds],sectorQuantities}:{})};
    if(record)Store.data[type]=Store.data[type].map(r=>r.id===id?updated:r);else Store.data[type].unshift(updated);
    if(isAta)Store.data.requests.forEach(r=>{if(r.ataId===id||(!r.ataId&&r.ata===row.number)){r.ataId=id;r.ata=values.number}});
    else for(const ata of Store.data.atas){ata.productIds=(ata.productIds||[]).filter(pid=>pid!==id);if(ataIds.has(ata.id))ata.productIds.push(id)}
    const saved=Store.save();close();onSave();toast(saved?'Cadastro e vínculos salvos.':'Dados nesta sessão. Exporte um backup: falha ao salvar.');
  };
}
