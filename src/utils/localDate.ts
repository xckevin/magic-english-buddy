/** Calendar arithmetic follows the learner's local day and daylight-saving changes. */
export function localDate(time = Date.now(), days = 0): string {
  const date = new Date(time);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
