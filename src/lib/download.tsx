import type { Guest } from './store';

function today(): string {
  return new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).replace(/\. /g, '-').replace('.', '');
}

export async function downloadExcel(guests: Guest[], fileName = '하객명부') {
  const XLSX = await import('xlsx');

  const rows = guests.map((g, i) => ({
    '번호':     i + 1,
    '구분':     g.side === 'groom' ? '신랑측' : '신부측',
    '이름':     g.name,
    '전화번호': g.phone,
    '그룹':     g.group,
    '축의금':   g.amount,
    '식권 수':  g.mealTickets,
    '답례품':   g.gift,
    '봉투번호': g.envelopeNumber,
    '접수시간': new Date(g.receivedAt).toLocaleString('ko-KR'),
    '비고':     g.note,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 5 }, { wch: 8 }, { wch: 10 }, { wch: 14 },
    { wch: 8 }, { wch: 12 }, { wch: 7 }, { wch: 7 },
    { wch: 8 }, { wch: 18 }, { wch: 20 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '하객명부');
  XLSX.writeFile(wb, `${fileName}_${today()}.xlsx`);
}
