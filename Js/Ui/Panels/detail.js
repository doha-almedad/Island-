(function(){var A=window.App=window.App||{};A.ui=A.ui||{};A.ui.panels=A.ui.panels||{};
var box;
A.ui.panels.detail={
  init:function(host){box=A.dom.el('section','panel');box.id='detail';box.hidden=true;host.appendChild(box);},
  open:function(i){
    box.innerHTML='<button class="x" aria-label="إغلاق">✕</button><h2>جزيرة '+i.name+'</h2><p>'+i.text+'</p>'+
      (i.open?'<div class="bar"><i style="width:'+i.progress+'%"></i></div><button class="glow-btn">ابدأ الرحلة</button>':'');
    box.querySelector('.x').onclick=A.ui.panels.detail.close;box.hidden=false;
  },
  close:function(){box.hidden=true;}
};
})();
