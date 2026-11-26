(function(){var A=window.App=window.App||{};A.ui=A.ui||{};A.ui.panels=A.ui.panels||{};
var box;
A.ui.panels.shipList={
  init:function(host){
    box=A.dom.el('section','panel','<h2>مرفأ الرحلات</h2>');box.id='trips';box.hidden=true;
    A.data.islands.filter(function(i){return i.open;}).forEach(function(i){
      var b=A.dom.el('button','glow-btn','رحلة إلى '+i.name);
      b.onclick=function(){A.ui.panels.detail.open(i);};box.appendChild(b);
    });
    host.appendChild(box);
  },
  toggle:function(){box.hidden=!box.hidden;},
  close:function(){box.hidden=true;}
};
})();
