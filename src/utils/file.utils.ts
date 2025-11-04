/**
 * Downloads data as a JSON file to the user's browser
 * @param data - The data to be downloaded as JSON
 * @param filename - The name of the file to download (defaults to 'data.json')
 */
export function downloadJson(data: unknown, filename = 'data.json'): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
