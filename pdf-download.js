/* PDF download, service period, and deletion UI improvements for v9. */
(function(){
  function updateButtons(){
    document.querySelectorAll('button').forEach(button=>{
      if(button.textContent.trim()==='PDF / Drucken')button.textContent='PDF herunterladen';
      const handler=button.getAttribute('onclick')||'';
      if(handler.includes('printDoc('))button.setAttribute('onclick',handler.replace('printDoc(', 'downloadDoc('));
    });
  }
  const previousRender=render;
  render=function(){previousRender();updateButtons();};
  const previousDocumentForm=documentForm;
  documentForm=function(...args){previousDocumentForm(...args);updateButtons();};
  const previousDelete=deleteDocument;
  deleteDocument=function(did){
    const d=doc(did);if(!d)return;
    if(d.type!=='Q')return previousDelete(did);
    const refs=state.docs.filter(x=>x.id!==did&&(x.sourceId===did||x.quoteId===did));
    const details=refs.length?'\n\nVerknüpfungen zu '+refs.map(x=>x.number||x.type).join(', ')+' werden entfernt. Die anderen Belege bleiben erhalten.':'';
    if(!confirm('Angebot '+(d.number||'')+' wirklich endgültig löschen?\n\nACHTUNG: Dieses Angebot kann nicht wiederhergestellt werden.'+details))return;
    refs.forEach(x=>{if(x.sourceId===did)x.sourceId='';if(x.quoteId===did)x.quoteId='';});
    state.docs=state.docs.filter(x=>x.id!==did);
    save();closeModal();render();
  };
  // Ensure service date is visible in the PDF even when it was saved in a legacy field.
  function getService(d){return String(d.serviceDate||d.servicePeriod||d.deliveryDate||'').trim();}
  window.downloadDoc=async function(did){
    const d=doc(did);if(!d)return alert('Dokument nicht gefunden.');
    if(typeof html2pdf!=='function')return alert('PDF-Bibliothek konnte nicht geladen werden. Bitte Internetverbindung prüfen und Seite neu laden.');
    // Existing printDoc creates all content including the detailed company footer.
    const realPrint=window.print;
    window.print=function(){};
    try{printDoc(did);}catch(e){window.print=realPrint;return alert('PDF konnte nicht vorbereitet werden: '+e.message);}
    finally{window.print=realPrint;}
    const original=document.querySelector('#printarea .paper');
    if(!original)return alert('PDF-Inhalt nicht gefunden.');
    const stage=document.createElement('div');stage.className='lg-pdf-stage';
    stage.style.cssText='position:fixed;left:-10000px;top:0;width:794px;z-index:-1;background:#fff;';
    const paper=original.cloneNode(true);
    paper.style.cssText='box-sizing:border-box;position:relative;width:210mm;min-height:0;height:auto;padding:34mm 55mm 18mm 19mm;background:white;color:#111;font-family:Arial,Helvetica,sans-serif;font-size:9.2pt;line-height:1.28;';
    const service=getService(d);
    let serviceNode=paper.querySelector('.service');
    if(service){
      if(!serviceNode){serviceNode=document.createElement('p');serviceNode.className='service';paper.querySelector('.doc-title')?.insertAdjacentElement('afterend',serviceNode);}
      serviceNode.innerHTML='<b>Leistungszeitraum / Lieferdatum:</b> '+esc(service);
      serviceNode.style.cssText='margin:2mm 0;font-size:9pt;display:block;';
    }
    const logo=paper.querySelector('.doc-logo');
    if(logo){logo.src=new URL('logo.png',document.baseURI).href;logo.style.cssText='position:absolute;right:12mm;top:12mm;width:57mm;height:17mm;object-fit:contain;display:block;';}
    const side=paper.querySelector('.company-side');const sideText=side?.innerText||'';if(side)side.remove();const oldNumber=paper.querySelector('.page-number');if(oldNumber)oldNumber.remove();;
    const sender=paper.querySelector('.sender');if(sender)sender.style.cssText='font-size:5.8pt;font-style:italic;margin-bottom:3mm;';
    const recipient=paper.querySelector('.recipient');if(recipient)recipient.style.cssText='white-space:pre-line;min-height:31mm;line-height:1.7;';
    const title=paper.querySelector('.doc-title');if(title)title.style.cssText='font-weight:800;font-style:italic;font-size:10pt;line-height:1.7;';
    const date=paper.querySelector('.doc-date');if(date)date.style.cssText='text-align:right;margin:1mm 0 10mm;white-space:nowrap;';
    const intro=paper.querySelector('.intro');if(intro)intro.style.cssText='margin:12mm 0 5mm;';
    const table=paper.querySelector('.document-table');if(table)table.style.cssText='width:100%;table-layout:fixed;border-collapse:collapse;font-size:7.5pt;';
    paper.querySelectorAll('.document-table th').forEach(e=>e.style.cssText='font-size:6.5pt;background:#bfc0c0;color:#111;padding:3px;');
    paper.querySelectorAll('.document-table td').forEach(e=>e.style.cssText='vertical-align:top;padding:10px 3px;border:0;overflow-wrap:anywhere;');
    const totals=paper.querySelector('.totals');if(totals)totals.style.cssText='margin:10mm 0 0 23%;border-top:1px solid #999;padding-top:4mm;font-size:8.5pt;';
    paper.querySelectorAll('.totals > div').forEach(e=>e.style.cssText+=';display:flex;justify-content:space-between;gap:10px;padding:2mm 0;');
    paper.querySelectorAll('.document-notes').forEach(e=>e.style.cssText+=';margin-top:13mm;font-size:9pt;line-height:1.5;');
    stage.appendChild(paper);document.body.appendChild(stage);
    try{
      if(logo){await new Promise(resolve=>{if(logo.complete)return resolve();logo.onload=resolve;logo.onerror=resolve;setTimeout(resolve,5000);});if(!logo.naturalWidth)throw Error('Logo konnte nicht geladen werden. Bitte logo.png im GitHub-Hauptverzeichnis prüfen.');}
      const filename=String(d.number||'Dokument').replace(/[^a-zA-Z0-9_.-]/g,'_')+'.pdf';
      // Generate PDF first, then draw page furniture at fixed physical A4 coordinates.
      // This prevents page numbers and the company sidebar from moving up on short documents.
      const worker=html2pdf().set({margin:0,filename,image:{type:'jpeg',quality:0.98},html2canvas:{scale:2,useCORS:true,scrollX:0,scrollY:0},jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},pagebreak:{mode:['css','legacy'],avoid:['.totals','.document-notes','tr']}}).from(paper).toPdf();
      const pdf=await worker.get('pdf');
      const pageCount=pdf.internal.getNumberOfPages();
      const sidebarLines=sideText.split('\n').map(x=>x.trim());
      for(let page=1;page<=pageCount;page++){
        pdf.setPage(page);
        // Page number is always 10 mm from the bottom edge.
        pdf.setFont('helvetica','normal');pdf.setFontSize(7);pdf.setTextColor(85,85,85);
        pdf.text('Seite '+page+(pageCount>1?' / '+pageCount:''),105,287,{align:'center'});
        // Company information is pinned to the right-hand column on every page.
        if(sidebarLines.length){
          pdf.setFontSize(6.3);pdf.setTextColor(115,115,115);
          const lineHeight=3.2;
          const startY=Math.max(35,278-sidebarLines.length*lineHeight);
          sidebarLines.forEach((line,i)=>{if(line)pdf.text(line,202,startY+i*lineHeight,{align:'right'});});
        }
      }
      await worker.save();
    }catch(e){alert('PDF-Download fehlgeschlagen: '+e.message);}finally{stage.remove();}
  };
  updateButtons();
})();
