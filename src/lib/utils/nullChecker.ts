// src/lib/utils/nullCheck.ts

export function callNullCheck(raw: any): any[] {
    if (!Array.isArray(raw)) throw new Error('Expected an array');
  
    return raw.map(item => cleanValue(item));
  }
  
  function cleanValue(value: any): any {
    if (value === null || value === 'null') return '';
    if (typeof value === 'number') return Number.isInteger(value) ? value.toString() : Math.floor(value).toString();
    if (Array.isArray(value)) return value.map(v => cleanValue(v));
    if (typeof value === 'object') return cleanObject(value);
    return value;
  }
  
  function cleanObject(obj: Record<string, any>): Record<string, any> {
    const cleaned: Record<string, any> = {};
    for (const key in obj) {
      cleaned[key] = cleanValue(obj[key]);
    }
    return cleaned;
  }