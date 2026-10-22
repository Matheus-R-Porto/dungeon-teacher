// Presentation-only registry. Closing a view never cancels its domain operation.
export class InterfaceSafety {
  constructor({isDangerous,clearInput,focus,canFocus=()=>true,eventTarget=window}) {
    Object.assign(this,{isDangerous,clearInput,focus,canFocus});
    this.entries=new Map();this.held=new Set();this.suppressed=new Set();this.blockClick=false;
    this.abort=new AbortController();const options={capture:true,signal:this.abort.signal};
    const consume=e=>{e.preventDefault();e.stopImmediatePropagation();};
    eventTarget.addEventListener('keydown',e=>{const key=e.code||e.key;this.held.add(key);if(this.suppressed.has(key)){consume(e);return;}if(!e.repeat)this.blockClick=false;},options);
    eventTarget.addEventListener('keyup',e=>{const key=e.code||e.key;this.held.delete(key);if(this.suppressed.delete(key))consume(e);},options);
    eventTarget.addEventListener('pointerdown',()=>{this.blockClick=false;},options);
    eventTarget.addEventListener('pointerup',e=>{if(this.blockClick)consume(e);},options);
    eventTarget.addEventListener('click',e=>{if(this.blockClick)consume(e);},options);
    eventTarget.addEventListener('blur',e=>{if(e.target===eventTarget){this.held.clear();this.suppressed.clear();}},options);
  }
  register(id,entry){this.entries.set(id,entry);return ()=>{if(this.entries.get(id)===entry)this.entries.delete(id);};}
  registerDialog(dialog){if(!dialog)return ()=>{};dialog.dataset.explorationInterface='';return this.register(dialog,{isOpen:()=>dialog.open,close:()=>dialog.close()});}
  has(dialog){return this.entries.has(dialog);}
  hit(event){return event?.hit===true&&this.isDangerous()?this.close('hit'):0;}
  close(reason='critical'){
    let count=0;
    for(const entry of this.entries.values())if(entry.isOpen()){
      if(!count){this.clearInput();for(const key of this.held)this.suppressed.add(key);this.blockClick=true;}
      entry.close(reason);count++;
    }
    if(count&&this.canFocus())this.focus();return count;
  }
  dispose(){this.abort.abort();this.entries.clear();this.held.clear();this.suppressed.clear();}
}
