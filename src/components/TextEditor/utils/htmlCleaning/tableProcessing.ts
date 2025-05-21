
/**
 * Process tables to ensure proper structure
 */
export const processTables = (container: HTMLElement): void => {
  const tables = container.querySelectorAll('table');
  tables.forEach(table => {
    // Ensure table has appropriate structure
    if (!table.querySelector('tbody') && table.querySelector('tr')) {
      const tbody = document.createElement('tbody');
      const rows = Array.from(table.querySelectorAll('tr'));
      rows.forEach(row => tbody.appendChild(row));
      table.appendChild(tbody);
    }
  });
};
