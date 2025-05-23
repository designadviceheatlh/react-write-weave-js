
/**
 * Utilities for detecting headings in plain text
 */

/**
 * Determines if a line appears to be a heading and what level
 */
export const isHeading = (line, surroundingLines) => {
  const lineIndex = surroundingLines.indexOf(line);
  
  // Check for # markdown style headings
  if (/^#{1,6}\s+/.test(line)) {
    const matches = line.match(/^(#{1,6})\s+/);
    const level = matches ? matches[1].length : 1;
    return { isHeading: true, level: Math.min(level, 6) };
  }
  
  // Check for shorter surrounding lines
  if (line.length > 10 && 
      lineIndex > 0 && 
      surroundingLines[lineIndex-1].trim().length === 0 && 
      (lineIndex === surroundingLines.length-1 || surroundingLines[lineIndex+1].trim().length === 0)) {
    return { isHeading: true, level: line.length > 20 ? 3 : 2 };
  }
  
  // Check for ALL CAPS patterns which are often headings
  if (line.toUpperCase() === line && line.length > 3 && line.match(/[A-Z]/)) {
    return { isHeading: true, level: line.length > 20 ? 2 : 1 };
  }
  
  return { isHeading: false, level: 0 };
};
