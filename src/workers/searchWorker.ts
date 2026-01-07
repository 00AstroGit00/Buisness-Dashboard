/**
 * Search Web Worker
 * Offloads fuzzy search and filtering from the main UI thread.
 * Prevents UI stuttering on 8GB RAM systems.
 */

self.onmessage = (e: MessageEvent) => {
  const { query, data, fields } = e.data;

  if (!query) {
    self.postMessage(data);
    return;
  }

  const q = query.toLowerCase();
  
  const filtered = data.filter((item: any) => {
    return fields.some((field: string) => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(q);
      }
      return false;
    });
  });

  self.postMessage(filtered);
};
