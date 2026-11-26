(function(){var A=window.App=window.App||{};A.ui=A.ui||{};A.ui.map=A.ui.map||{};
A.ui.map.renderShips=function(scene){
  [[12,76],[32,72],[54,80],[72,74],[88,82]].forEach(function(p,n){
    var s=A.dom.el('div','ship'+(n%2?' flip':''),'<svg viewBox="0 0 100 100"><use href="#ship"/></svg>');
    s.style.left=p[0]+'%';s.style.top=p[1]+'%';s.style.animationDelay=(n*-1.1)+'s';
    scene.appendChild(s);
  });
};
})();
