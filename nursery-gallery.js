/* Display a picture-based Nursery experience without changing any other grade. */
(()=>{
  'use strict';
  const groups=window.TLW_NURSERY_GALLERY||[];
  const $=id=>document.getElementById(id);
  const gallery=$('nurseryVisualGallery');
  if(!gallery||!groups.length)return;

  const escapeHtml=s=>String(s).replace(/[&<>"']/g,char=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[char]));
  const total=groups.reduce((n,g)=>n+g.examples.length,0);
  $('nurseryExampleCount').textContent=total+' picture examples across '+groups.length+' learning areas';

  gallery.querySelector('#nurseryVisualAreas').innerHTML=groups.map((group,index)=>{
    const artwork=group.poster?'<figure class="nursery-feature-poster">'+
      '<img src="'+escapeHtml(group.poster)+'" alt="Illustrated learning poster showing numbers 1 to 3, five stars, four colours, shapes, and big/small and more/less comparisons" loading="lazy" width="1120" height="1400">'+
      '<figcaption>Colourful Early Mathematics learning poster. <a href="'+escapeHtml(group.poster)+'" target="_blank" rel="noopener">View larger picture ↗</a></figcaption>'+
      '</figure>':'';
    const cards=group.examples.map((example,i)=>{
      const visualClass=example.visual.length>15?' nursery-visual-small':'';
      return '<figure class="nursery-example-card">'+
        '<div class="nursery-visual'+visualClass+'" role="img" aria-label="'+escapeHtml(example.title+': '+example.visual)+'">'+
        '<span class="nursery-sticker" aria-hidden="true">'+escapeHtml(example.visual)+'</span>'+
        '<span class="nursery-picture-spark nursery-picture-spark-a" aria-hidden="true">✦</span>'+
        '<span class="nursery-picture-spark nursery-picture-spark-b" aria-hidden="true">✳</span>'+
        '</div>'+
        '<figcaption><span class="nursery-example-label">EXAMPLE '+(i+1)+'</span>'+
        '<h4>'+escapeHtml(example.title)+'</h4>'+
        '<p>'+escapeHtml(example.caption)+'</p></figcaption>'+
        '</figure>';
    }).join('');
    return '<section class="nursery-area nursery-theme-'+escapeHtml(group.theme)+'" aria-labelledby="nursery-area-'+index+'">'+
      '<header class="nursery-area-heading">'+
        '<span class="nursery-area-icon" aria-hidden="true">'+escapeHtml(group.icon)+'</span>'+
        '<div><span class="nursery-area-eyebrow">LEARNING AREA '+(index+1)+'</span>'+
          '<h3 id="nursery-area-'+index+'">'+escapeHtml(group.title)+'</h3>'+
          '<p>'+escapeHtml(group.description)+'</p></div>'+
        '<span class="nursery-area-count">10 pictures</span>'+
      '</header>'+
      artwork+
      '<div class="nursery-picture-grid">'+cards+'</div>'+
    '</section>';
  }).join('');

  const hiddenForNursery=[
    'curriculumSection','courseGrid','emptyState'
  ].map($).concat([
    document.querySelector('#explore .starter-heading'),
    document.querySelector('#explore .course-toolbar'),
    document.querySelector('#explore .curriculum-note')
  ]).filter(Boolean);

  function update(){
    const isNursery=$('classSelect').value==='-2';
    gallery.hidden=!isNursery;
    for(const el of hiddenForNursery){
      if(isNursery)el.hidden=true;
      else if(el.id!=='curriculumSection'&&el.id!=='emptyState')el.hidden=false;
    }
  }
  $('classSelect').addEventListener('change',update);
  $('gradeShortcuts').addEventListener('click',e=>{
    if(e.target.closest('[data-grade]'))update();
  });
  update();
})();