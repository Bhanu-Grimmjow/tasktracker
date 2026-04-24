const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function format(date, pattern) {
  const d = new Date(date);
  return pattern
    .replace('EEEE', DAYS[d.getDay()])
    .replace('MMMM', MONTHS[d.getMonth()])
    .replace('MMM', SHORT_MONTHS[d.getMonth()])
    .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
    .replace('yyyy', d.getFullYear())
    .replace('d', d.getDate());
}

export function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export function toDateStr(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
