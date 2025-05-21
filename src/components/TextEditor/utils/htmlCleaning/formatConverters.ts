
/**
 * Convert divs to paragraphs when appropriate
 */
export const convertDivsToParagraphs = (container: HTMLElement, contentSource: string): void => {
  const divs = container.querySelectorAll('div');
  
  divs.forEach(div => {
    // Skip if this div contains headings or lists
    if (div.querySelector('h1, h2, h3, h4, h5, h6, ul, ol')) return;
    
    const p = document.createElement('p');
    p.innerHTML = div.innerHTML;
    p.setAttribute('data-source', div.getAttribute('data-source') || contentSource);
    div.parentNode?.replaceChild(p, div);
  });
};
