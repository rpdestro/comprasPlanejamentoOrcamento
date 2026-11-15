export const remaining = row => Math.max(0, Number(row.quantity) - Number(row.received || 0));
export function migrateRequests(data) {
  for (const row of data.requests) {
    row.groupId ||= row.id;
    row.requestNumber ||= 'SOL-' + String(row.id).slice(0, 8).toUpperCase();
    if (row.received === undefined) row.received = row.status === 'Concluída' ? Number(row.quantity) : 0;
    row.receipts ||= [];
    row.responsible ??= data.sectors.find(s => s.name === row.sector)?.responsible || '';
    row.ramal ??= '';
  }
}
export function receiptStatus(row) {
  if (row.status === 'Cancelada') return 'Cancelada';
  if (remaining(row) === 0) return 'Concluída';
  return Number(row.received) > 0 ? 'Em andamento' : 'Pendente';
}
export function groupRows(rows) {
  const groups = new Map();
  for (const row of rows) { const id = row.groupId || row.id; if (!groups.has(id)) groups.set(id, []); groups.get(id).push(row); }
  return [...groups.values()];
}
export function receiveBatch(rows, amounts, date, note = '') {
  let total = 0;
  for (const row of rows) {
    const value = Number(amounts[row.id] || 0);
    if (!Number.isSafeInteger(value) || value < 0 || value > remaining(row)) throw Error('A quantidade recebida deve ser inteira, positiva e não pode ultrapassar o saldo pendente.');
    if (row.status === 'Cancelada' && value) throw Error('Não é possível dar baixa em um item cancelado.');
    total += value;
  }
  if (!total) throw Error('Informe a quantidade recebida de pelo menos um produto.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw Error('Informe a data do recebimento.');
  for (const row of rows) {
    const quantity = Number(amounts[row.id] || 0);
    if (!quantity) continue;
    row.received = Number(row.received || 0) + quantity;
    row.receipts = [...(row.receipts || []), {id: crypto.randomUUID(), date, quantity, note, recordedAt: new Date().toISOString()}];
    row.status = receiptStatus(row);
  }
}

export function requestGroups(rows) {
  return groupRows(rows).map(items => ({...items[0], items, status: items.every(r=>r.status==='Cancelada') ? 'Cancelada' : items.every(r=>r.status==='Concluída'||r.status==='Cancelada') ? 'Concluída' : items.some(r=>r.received>0||r.status==='Em andamento') ? 'Em andamento' : 'Pendente'}));
}
