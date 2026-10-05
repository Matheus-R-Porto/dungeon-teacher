export class InputController {
  constructor(canvas, actions) {
    this.keys = new Set();
    this.canvas = canvas;
    this.dragPointer = null;
    this.lastDragX = 0;
    this.buttonOrbit = 0;
    this.abort = new AbortController();
    const options = { signal: this.abort.signal };
    const editable = event => event.target instanceof HTMLElement && (event.target.matches('input,textarea,select') || event.target.isContentEditable);
    window.addEventListener('keydown', event => {
      if (editable(event) || actions.isBlocked()) return;
      const key = event.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'q', 'e'].includes(key)) { event.preventDefault(); this.keys.add(key); }
      if (event.repeat) return;
      if (['q', 'e', 'f', 'h', 'escape', '+', '=', '-'].includes(key)) event.preventDefault();
      if (key === 'f') actions.interact();
      if (key === ' ') { event.preventDefault(); actions.pull?.(); }
      if (key === 'h') actions.help();
      if (key === 'escape') actions.escape();
      if (key === '+' || key === '=') actions.zoom(-2);
      if (key === '-') actions.zoom(2);
    }, options);
    window.addEventListener('keyup', event => this.keys.delete(event.key.toLowerCase()), options);
    window.addEventListener('blur', () => { this.clear(); actions.blur(); }, options);
    document.addEventListener('visibilitychange', () => { if (document.hidden) { this.clear(); actions.blur(); } }, options);
    canvas.addEventListener('pointerdown', event => {
      if (actions.isBlocked()) return;
      if (event.button === 1) {
        event.preventDefault(); canvas.focus({ preventScroll: true });
        this.dragPointer = event.pointerId; this.lastDragX = event.clientX;
        canvas.setPointerCapture(event.pointerId); canvas.classList.add('orbiting'); return;
      }
      if (event.button !== 0 || this.dragPointer !== null) return;
      canvas.focus({ preventScroll: true }); actions.moveTo(event.clientX, event.clientY);
    }, options);
    canvas.addEventListener('pointermove', event => {
      if (event.pointerId !== this.dragPointer) return;
      if (!(event.buttons & 4) || actions.isBlocked()) { this.endDrag(); return; }
      actions.drag(event.clientX - this.lastDragX); this.lastDragX = event.clientX;
    }, options);
    canvas.addEventListener('pointerup', event => { if (event.pointerId === this.dragPointer && event.button === 1) this.endDrag(); }, options);
    canvas.addEventListener('pointercancel', () => this.endDrag(), options);
    canvas.addEventListener('lostpointercapture', () => { this.dragPointer = null; canvas.classList.remove('orbiting'); }, options);
    canvas.addEventListener('auxclick', event => { if (event.button === 1) event.preventDefault(); }, options);
    canvas.addEventListener('wheel', event => { event.preventDefault(); if (!actions.isBlocked()) actions.zoom(Math.sign(event.deltaY) * 1.2); }, { ...options, passive: false });
    canvas.addEventListener('contextmenu', event => event.preventDefault(), options);
  }
  get axis() { return { x: Number(this.keys.has('d') || this.keys.has('arrowright')) - Number(this.keys.has('a') || this.keys.has('arrowleft')), z: Number(this.keys.has('s') || this.keys.has('arrowdown')) - Number(this.keys.has('w') || this.keys.has('arrowup')) }; }
  get orbitAxis() { return Math.max(-1, Math.min(1, Number(this.keys.has('e')) - Number(this.keys.has('q')) + this.buttonOrbit)); }
  bindOrbitButton(button, direction) {
    const options = { signal: this.abort.signal };
    button.addEventListener('pointerdown', event => { if (event.button !== 0) return; event.preventDefault(); this.buttonOrbit = direction; button.setPointerCapture(event.pointerId); }, options);
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture', 'blur']) button.addEventListener(type, () => { this.buttonOrbit = 0; }, options);
    button.addEventListener('keydown', event => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); this.buttonOrbit = direction; } }, options);
    button.addEventListener('keyup', () => { this.buttonOrbit = 0; }, options);
  }
  endDrag() {
    const pointer = this.dragPointer; this.dragPointer = null; this.canvas.classList.remove('orbiting');
    if (pointer !== null && this.canvas.hasPointerCapture(pointer)) this.canvas.releasePointerCapture(pointer);
  }
  clear() { this.keys.clear(); this.buttonOrbit = 0; this.endDrag(); }
  dispose() { this.abort.abort(); this.clear(); }
}
