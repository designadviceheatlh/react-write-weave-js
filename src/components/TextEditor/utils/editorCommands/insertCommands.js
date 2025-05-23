
/**
 * Insere um divisor horizontal no editor
 */
export const handleInsertDivider = (handleChange) => {
  // Criar elemento divisor
  const divider = document.createElement('hr');
  divider.className = 'my-4 border-t border-gray-300';
  
  // Inserir o divisor na posição atual do cursor
  document.execCommand('insertHTML', false, divider.outerHTML);
  
  if (handleChange) {
    handleChange();
  }
};

/**
 * Handles list indentation with Tab key
 * @param isShiftKey Whether Shift key was pressed with Tab (outdent)
 * @param handleChange Callback to trigger after changes
 * @returns boolean indicating if indentation was handled
 */
export const handleListIndentation = (isShiftKey = false, handleChange) => {
  // Get the current selection
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;

  // Find the list item node at or containing the current selection
  const range = selection.getRangeAt(0);
  let currentNode = range.startContainer;
  let listItemNode = null;

  // Walk up the DOM to find the closest LI element
  while (currentNode && currentNode !== document.body) {
    if (currentNode.nodeName === 'LI') {
      listItemNode = currentNode;
      break;
    }
    currentNode = currentNode.parentNode;
  }

  // If we're not in a list item, do nothing
  if (!listItemNode) return false;

  // Get the parent list and its type
  const parentList = listItemNode.parentElement;
  if (!parentList || (parentList.nodeName !== 'UL' && parentList.nodeName !== 'OL')) return false;

  const listType = parentList.nodeName.toLowerCase();

  if (isShiftKey) {
    // OUTDENT: Move the current list item one level up
    return handleListOutdent(listItemNode, parentList, listType, handleChange);
  } else {
    // INDENT: Nest the current list item under the previous sibling
    return handleListIndent(listItemNode, parentList, listType, handleChange);
  }
};

/**
 * Handles list item indentation (Tab key)
 */
function handleListIndent(
  listItem,
  parentList,
  listType,
  handleChange
) {
  // We can only indent if there's a previous sibling to nest under
  const previousSibling = listItem.previousElementSibling;
  if (!previousSibling) return false;

  // Look for an existing sublist in the previous sibling
  let subList = Array.from(previousSibling.children).find(
    child => child.nodeName === 'UL' || child.nodeName === 'OL'
  );

  // Create a sublist if none exists
  if (!subList) {
    // Use the current list type for consistency
    subList = document.createElement(listType);
    previousSibling.appendChild(subList);
  }

  // Move the current item to the sublist
  subList.appendChild(listItem);

  // Notify change
  if (handleChange) {
    handleChange();
  }
  
  return true;
}

/**
 * Handles list item outdent (Shift+Tab key)
 */
function handleListOutdent(
  listItem,
  parentList,
  listType,
  handleChange
) {
  // We can only outdent if we're in a nested list
  const parentListItem = parentList.parentElement;
  if (!parentListItem || parentListItem.nodeName !== 'LI') return false;

  // Get the grandparent list
  const grandparentList = parentListItem.parentElement;
  if (!grandparentList) return false;

  // Move all items after this one to a new sublist inside this item
  const nextSiblings = [];
  let sibling = listItem.nextElementSibling;
  
  while (sibling) {
    nextSiblings.push(sibling);
    sibling = sibling.nextElementSibling;
  }
  
  // Insert the current list item after the parent list item in the grandparent list
  grandparentList.insertBefore(listItem, parentListItem.nextElementSibling);

  // If there were siblings after the outdented item, move them to a new sublist
  if (nextSiblings.length > 0) {
    // If there's no existing sublist in the outdented item, create one
    const existingSublist = Array.from(listItem.children).find(
      child => child.nodeName === 'UL' || child.nodeName === 'OL'
    );
    
    const newSublist = existingSublist || document.createElement(parentList.nodeName);
    
    if (!existingSublist) {
      listItem.appendChild(newSublist);
    }

    // Move the siblings to the new sublist
    nextSiblings.forEach(sibling => {
      newSublist.appendChild(sibling);
    });
  }

  // If the parent list is now empty, remove it
  if (!parentList.hasChildNodes()) {
    parentListItem.removeChild(parentList);
  }

  // Notify change
  if (handleChange) {
    handleChange();
  }
  
  return true;
}
