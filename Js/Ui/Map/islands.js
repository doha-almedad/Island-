(function(){var A=window.App=window.App||{};A.ui=A.ui||{};A.ui.map=A.ui.map||{};
A.ui.map.renderIslands=function(scene){
  A.data.islands.forEach(function(i){
    var b=A.dom.el('button','island'+(i.open?'':' is-soon'),'<span class="land" style="--w:'+i.w+'px"><i>'+i.icon+'</i></span><span class="banner">'+i.name+'</span>');
    b.style.left=i.x+'%';b.style.top=i.y+'%';b.setAttribute('aria-label',i.name);
    b.addEventListener('click',function(){A.ui.panels.detail.open(i);});
    scene.appendChild(b);
  });
};
})();
