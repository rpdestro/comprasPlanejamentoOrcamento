export const escape=(s='')=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
export const normalize=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export const statusClass=s=>normalize(s).replaceAll(' ','-');
export const number=n=>new Intl.NumberFormat('pt-BR').format(n);
export function toast(message){const t=document.getElementById('toast');t.textContent=message;t.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove('show'),4000)}
export function filtered(rows,filters,sort){return rows.filter(row=>(!filters.search||normalize(Object.values(row).join(' ')).includes(normalize(filters.search)))&&(!filters.sector||row.sector===filters.sector)&&(!filters.status||row.status===filters.status)&&(!filters.code||normalize(row.code).includes(normalize(filters.code)))).sort((a,b)=>typeof a[sort.key]==='number'?(a[sort.key]-b[sort.key])*sort.direction:String(a[sort.key]??'').localeCompare(String(b[sort.key]??''),'pt-BR',{numeric:true})*sort.direction)}
