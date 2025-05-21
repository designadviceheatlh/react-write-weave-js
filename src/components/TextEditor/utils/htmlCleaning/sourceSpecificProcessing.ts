
/**
 * Handle line breaks in PDF content
 */
export const handlePdfLineBreaks = (container: HTMLElement): void => {
  // PDFs often have many <br> elements, convert sequences of them to paragraphs
  const processBreaks = (element: Element) => {
    const html = element.innerHTML;
    const processed = html.replace(/(<br\s*\/?>){2,}/gi, '</p><p>');
    element.innerHTML = processed;
  };
  
  // Process breaks in each paragraph
  container.querySelectorAll('p').forEach(processBreaks);
};
