export function insertAdjacentElement(position, dToInsert) {
  let dTarget = this,
    dTargetParent = dTarget.parentNode,
    node, first, next;

  switch (position.toLowerCase()) {
    case 'beforebegin':
      dTargetParent.insertBefore(dToInsert, dTarget);
      break;
    case 'afterbegin':
      dTarget.insertBefore(dToInsert, dTarget.firstChild);
      break;
    case 'beforeend':
      dTarget.insertBefore(dToInsert, dTarget.lastChild.nextSibling);
      // Note: If fine if dTarget.lastChild.nextSibling doesn't exist, because .nextSibling will be null and
      //       insertBefore handles that case by adding to the end of the list.
      break;
    case 'afterend':
      dTargetParent.insertBefore(dToInsert, dTarget.nextSibling);
      // Note: If fine if dTarget.nextSibling doesn't exist, because .nextSibling will be null and
      //       insertBefore handles that case by adding to the end of the list.
      break;
  }
  return dToInsert;
}