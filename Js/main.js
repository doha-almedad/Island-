(function(){var A=window.App;
document.addEventListener('DOMContentLoaded',function(){
  var scene=document.getElementById('scene'),host=document.getElementById('panels');
  A.ui.map.renderShips(scene);
  A.ui.map.renderIslands(scene);
  A.ui.panels.detail.init(host);
  A.ui.panels.shipList.init(host);
  document.getElementById('d-list').onclick=A.ui.panels.shipList.toggle;
  document.getElementById('d-close').onclick=function(){A.ui.panels.detail.close();A.ui.panels.shipList.close();};
});
})();
