/** Small explicit schema decoder for local backup files. Unknown fields are discarded. */
export type Decoder = (value: unknown) => unknown;
export function invalid(): never {
  throw new Error('备份文件内容不完整或格式不受支持，请选择本应用导出的备份。');
}
export const string =
  (max = 10000): Decoder =>
  value =>
    typeof value === 'string' && value.length <= max ? value : invalid();
export const identifier: Decoder = value =>
  typeof value === 'string' && value.length > 0 && value.length <= 200 ? value : invalid();
export const number =
  (max = Number.MAX_SAFE_INTEGER): Decoder =>
  value =>
    typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max
      ? value
      : invalid();
export const integer =
  (max = Number.MAX_SAFE_INTEGER): Decoder =>
  value =>
    Number.isInteger(number(max)(value)) ? value : invalid();
export const boolean: Decoder = value => (typeof value === 'boolean' ? value : invalid());
export const oneOf =
  (...values: unknown[]): Decoder =>
  value =>
    values.includes(value) ? value : invalid();
export const optional =
  (decode: Decoder): Decoder =>
  value =>
    value === undefined ? undefined : decode(value);
export const array =
  (decode: Decoder, max = 50000): Decoder =>
  value =>
    Array.isArray(value) && value.length <= max ? value.map(decode) : invalid();
export const object =
  (shape: Record<string, Decoder>): Decoder =>
  value => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return invalid();
    const record = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(shape).map(([key, decode]) => [key, decode(record[key])])
    );
  };
export const answer: Decoder = value =>
  typeof value === 'string' ? string()(value) : array(string(), 500)(value);
export const date: Decoder = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return invalid();
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
    ? value
    : invalid();
};
export const settings = object({
  language: oneOf('zh-CN', 'en-US'),
  ttsSpeed: oneOf(0.8, 1, 1.2),
  soundEnabled: boolean,
  vibrationEnabled: boolean,
  autoPlayTTS: boolean,
  showTranslation: boolean,
});
