import { writeFileSync } from 'fs';

/**
 * Write raw CSV content to a file.
 */
export function saveToCsv(filePath, csvStr) {
  writeFileSync(filePath, csvStr, 'utf8');
  console.log(`Saved to ${filePath}`);
}

export function formatOutput(data, useJson = true) {
  if (useJson) {
    return JSON.stringify(data, null, 2);
  }

  // Human-readable mode
  if (Array.isArray(data)) {
    if (data.length === 0) return '(empty result)';
    // Use console.table-style output for arrays of objects
    if (typeof data[0] === 'object' && data[0] !== null) {
      return tableFormat(data);
    }
    return data.map((item, i) => `[${i}] ${item}`).join('\n');
  }

  if (typeof data === 'object' && data !== null) {
    // If it has a data property that is an array, format that
    if (Array.isArray(data.data)) {
      const header = Object.entries(data)
        .filter(([k]) => k !== 'data')
        .map(([k, v]) => `${k}: ${v}`)
        .join(' | ');
      const body = data.data.length > 0 ? tableFormat(data.data) : '(no data)';
      return header ? `${header}\n\n${body}` : body;
    }
    return keyValueFormat(data);
  }

  return String(data);
}

function keyValueFormat(obj, indent = 0) {
  const pad = ' '.repeat(indent);
  return Object.entries(obj)
    .map(([k, v]) => {
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        return `${pad}${k}:\n${keyValueFormat(v, indent + 2)}`;
      }
      return `${pad}${k}: ${JSON.stringify(v)}`;
    })
    .join('\n');
}

function tableFormat(arr) {
  if (arr.length === 0) return '(empty)';
  const keys = Object.keys(arr[0]);
  const widths = keys.map((k) =>
    Math.max(k.length, ...arr.map((row) => String(row[k] ?? '').length))
  );

  // Cap column widths to 40 chars
  const maxWidth = 40;
  const cappedWidths = widths.map((w) => Math.min(w, maxWidth));

  const header = keys.map((k, i) => k.padEnd(cappedWidths[i])).join('  ');
  const separator = cappedWidths.map((w) => '-'.repeat(w)).join('  ');
  const rows = arr.map((row) =>
    keys
      .map((k, i) => {
        const val = String(row[k] ?? '');
        return val.length > maxWidth
          ? val.slice(0, maxWidth - 3) + '...'
          : val.padEnd(cappedWidths[i]);
      })
      .join('  ')
  );

  return [header, separator, ...rows].join('\n');
}

export function printOutput(data, useJson = true) {
  console.log(formatOutput(data, useJson));
}
