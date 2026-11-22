(() => {
 let deferredPrompt=null,installed=false,registrationError=false;
 const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 const secure=()=>window.isSecureContext&&['https:','http:'].includes(location.protocol);
 const dialog=document.querySelector('#install-dialog');
 const message=document.querySelector('#install-message');
 const secureLink=document.querySelector('#install-https');

 window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();
  deferredPrompt=event;
 });
 window.addEventListener('appinstalled',()=>{
  installed=true;
  deferredPrompt=null;
  if(dialog.open)showHelp();
 });

 function showHelp(extra=''){
  const agent=navigator.userAgent,appleMobile=/iPhone|iPad|iPod/.test(agent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  secureLink.hidden=true;
  if(standalone()||installed)message.textContent='O Tia Tay já está instalado neste aparelho.';
  else if(!secure()){
   message.textContent='Abra o endereço publicado do Tia Tay com HTTPS para instalar.';
   if(location.protocol==='http:'){
    const url=new URL(location.href);url.protocol='https:';
    secureLink.href=url.href;secureLink.hidden=false;
   }
  }else if(appleMobile)message.textContent='No Safari, toque em Compartilhar → Adicionar à Tela de Início → Adicionar.';
  else if(/Android/.test(agent))message.textContent='No Chrome, abra o menu ⋮ → Instalar app ou Adicionar à tela inicial.';
  else if(/Macintosh/.test(agent)&&/Safari/.test(agent)&&!/Chrome|Chromium|Edg/.test(agent))message.textContent='No Safari, abra Arquivo → Adicionar ao Dock.';
  else message.textContent='No Chrome ou Edge, use o ícone de instalação na barra de endereço ou procure Instalar este site como aplicativo no menu do navegador.';
  if(extra)message.textContent=extra+' '+message.textContent;
  else if(registrationError&&!standalone()&&!installed&&secure())message.textContent+=' Os arquivos de instalação não carregaram. Reabra o endereço publicado e tente novamente.';
  if(!dialog.open)dialog.showModal();
 }

 document.addEventListener('click',async event=>{
  if(!event.target.closest('[data-install]'))return;
  if(!deferredPrompt||standalone()||installed){showHelp();return}
  const prompt=deferredPrompt;
  deferredPrompt=null;
  try{
   const result=await prompt.prompt();
   if(result?.outcome==='accepted')installed=true;
   else if(result?.outcome==='dismissed')showHelp('A instalação foi cancelada.');
  }catch(error){showHelp()}
 });

 if(secure()&&'serviceWorker' in navigator){
  navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).catch(error=>{
   registrationError=true;
   console.warn('Instalação do Tia Tay',error);
  });
 }
})();
