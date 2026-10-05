// Shared renderer stays independent of Electron; the optional bridge is injected
// only by the desktop preload. Pending domain transactions must finish first.
export async function saveBeforeClose({pause,cancel,isBusy,save,now=Date.now,wait=ms=>new Promise(resolve=>setTimeout(resolve,ms))}) {
  pause();cancel();const deadline=now()+10000;
  while(isBusy()) {if(now()>=deadline)throw Error('Há uma operação ainda em andamento. Tente fechar novamente.');await wait(25);}
  await save();
}
