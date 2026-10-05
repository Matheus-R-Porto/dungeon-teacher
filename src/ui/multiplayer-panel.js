export class MultiplayerPanel {
  constructor({client,identityStore,open,debug=false}){
    this.client=client;this.identityStore=identityStore;
    this.button=document.createElement('button');this.button.id='multiplayer-button';this.button.className='multiplayer-status';this.button.textContent='Multiplayer · Offline';document.querySelector('#app').append(this.button);
    this.dialog=document.createElement('dialog');this.dialog.id='multiplayer-dialog';
    this.dialog.innerHTML='<button class="close-button" aria-label="Fechar" data-close>×</button><span class="eyebrow">REFÚGIO COMPARTILHADO</span><h2>Multiplayer</h2><p>Encontre outros viajantes no Refúgio. A Torre continua sendo uma aventura individual.</p><label for="multiplayer-name">Seu nome</label><input id="multiplayer-name" maxlength="24" minlength="2" autocomplete="off"><p class="multiplayer-detail" role="status"></p><button class="primary-button multiplayer-connect">Conectar</button><pre class="multiplayer-debug" hidden></pre>';
    document.querySelector('#app').append(this.dialog);this.name=this.dialog.querySelector('input');this.name.value=identityStore?.identity.name??'Viajante';
    this.connectButton=this.dialog.querySelector('.multiplayer-connect');this.detail=this.dialog.querySelector('.multiplayer-detail');this.debug=this.dialog.querySelector('pre');this.debug.hidden=!debug;
    this.button.onclick=()=>open(this.dialog.id);
    this.connectButton.onclick=()=>{try{if(client.desired)client.disconnect();else{identityStore.saveName(this.name.value);client.connect();}this.update();}catch(error){this.detail.textContent=error.message;}};
    this.update();
  }
  update(){const c=this.client,count=c.remotes.size+1;this.button.textContent=`Multiplayer · ${c.status}${c.status==='Online'?' · '+count+(count===1?' jogador':' jogadores'):''}`;this.button.dataset.online=String(c.status==='Online');this.detail.textContent=c.detail||(c.status==='Online'?'Você está no Refúgio compartilhado.':c.status);this.name.disabled=c.desired;this.connectButton.textContent=c.desired?'Desconectar':'Conectar';this.connectButton.disabled=(!c.inHub&&!c.desired)||!this.identityStore;this.debug.textContent=`id: ${c.identity.id}\nroom: hub-01\nestado: ${c.status}\nremotos: ${c.remotes.size}\nping: ${c.ping??'—'} ms`;}
  dispose(){this.button.remove();this.dialog.remove();}
}
