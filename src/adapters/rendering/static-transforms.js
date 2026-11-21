// Only for completed, immobile environment subtrees under an immobile parent.
// Visibility and material opacity remain live; animated subtrees are excluded.
export function freezeStaticSubtree(root,{exclude=new Set()}={}){
 root.updateWorldMatrix(true,true);
 let count=0;
 function visit(node){
  if(exclude.has(node))return;
  node.matrixAutoUpdate=false;node.matrixWorldAutoUpdate=false;count++;
  for(const child of node.children)visit(child);
 }
 visit(root);return count;
}
