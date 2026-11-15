import {Store} from './store.js';
import {escape as esc} from './utils.js';
import {mountPicker} from './picker.js';

export function mountAtaItems(container,{row,sectorIds,productIds}){
  const pending=new Set();
  const quantities=structuredClone(row.sectorQuantities||{});
  container.innerHTML='<div class="ata-catalog-area"><div id="ata-catalog"></div><button type="button" class="btn primary" id="ata-add-items">Inserir itens selecionados</button><p id="ata-items-message" role="status"></p></div><section id="ata-added-items"></section>';
  mountPicker(container.querySelector('#ata-catalog'),{id:'ata-products',rows:Store.data.products,selected:pending,label:'produtos por código ou descrição',detail:p=>'Código: '+p.code+' · '+p.unit,pageSize:5});
  const list=container.querySelector('#ata-added-items');
  function render(){
    const products=Store.data.products.filter(p=>productIds.has(p.id));
    const sectors=Store.data.sectors.filter(s=>sectorIds.has(s.id));
    list.innerHTML=`<div class="ata-added-heading"><h3>Itens adicionados <span class="count-pill">${products.length}</span></h3><p>Quantidade prevista por setor · deixe em branco quando não definida.</p></div>`+
      (products.length?products.map(p=>`<article class="ata-added-item"><div class="ata-item-heading"><div><strong class="code">${esc(p.code)}</strong><details class="ata-description"><summary title="Clique para ver a descrição completa">${esc(p.product)}</summary><p>${esc(p.product)}</p></details><small>Unidade: ${esc(p.unit)}</small></div><button type="button" class="btn" data-remove-product="${esc(p.id)}">Remover</button></div><div class="ata-sector-quantities">${sectors.map(s=>`<label class="field">${esc(s.name)}<input type="number" min="0" step="any" inputmode="decimal" data-product="${esc(p.id)}" data-sector="${esc(s.id)}" aria-label="Quantidade de ${esc(p.code)} para ${esc(s.name)}" value="${esc(quantities[s.id]?.[p.id]??'')}" placeholder="—"></label>`).join('')||'<p>Selecione os setores participantes para informar as quantidades.</p>'}</div></article>`).join(''):'<p>Nenhum item adicionado. Selecione os produtos acima e clique em Inserir itens selecionados.</p>');
    list.querySelectorAll('[data-product]').forEach(input=>input.oninput=()=>{quantities[input.dataset.sector]??={};quantities[input.dataset.sector][input.dataset.product]=input.value});
    list.querySelectorAll('[data-remove-product]').forEach(button=>button.onclick=()=>{productIds.delete(button.dataset.removeProduct);render()});
  }
  container.querySelector('#ata-add-items').onclick=()=>{
    pending.forEach(id=>productIds.add(id));
    container.querySelector('#ata-items-message').textContent=pending.size?'Itens adicionados.':'Selecione pelo menos um produto.';
    pending.clear();
    container.querySelector('#ata-catalog [data-clear-selection]').click();
    render();
  };
  render();
  return {render,values(){
    if(pending.size)throw Error('Clique em Inserir itens selecionados antes de salvar a ATA.');
    const output={};
    for(const sectorId of sectorIds){
      output[sectorId]={};
      for(const productId of productIds){
        const value=quantities[sectorId]?.[productId];
        if(value===undefined||value==='')continue;
        const quantity=Number(value);
        if(!Number.isFinite(quantity)||quantity<0)throw Error('Informe quantidades válidas, maiores ou iguais a zero.');
        output[sectorId][productId]=quantity;
      }
    }
    return output;
  }};
}
