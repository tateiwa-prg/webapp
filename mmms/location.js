$(document).ready(function() {
  //type 判定
  let pi = getParam("pi");
  let a_pi = pi.split(kgr);
  bukken_thispage = localStorage.getItem("mmms_nowbukken");
  let w = JSON.parse(sessionStorage.getItem("mmms_bukken"));
  //console.log(bukken_thispage,w);
  nowbukken_JP = w[bukken_thispage].S;
  console.log(bukken_thispage,nowbukken_JP,a_pi);

  get_js_file_name();//テスト用か判断

  //センサー情報
  if(a_pi[a_pi.length-1]=="g"){
    //業者ごと
    get_data_gyosha();
  }else{
    //フロアごと
    get_data();
  }
});

var bukken_thispage;
var nowbukken_JP;
var floormap;

var path_post="get-location";

//このjsファイル名
function get_js_file_name() {
  let fp="";
  if (document.currentScript) {
      fp=document.currentScript.src;
  } else {
      var scripts = document.getElementsByTagName('script'),
      script = scripts[scripts.length-1];
      if (script.src) {
        fp=script.src;
      }
  }
  let sl=fp.split("/");
  let dot=sl[sl.length-1].split(".");
  //console.log(dot[0]);
  if(dot[0]=="test"){
    path_post="test";
  }
}

//業者ごと
function get_data_gyosha() {
  let pass = "mmms/"+path_post;
  //console.log(pass);
  let body = {
    bukken: bukken_thispage,
    gyosha:"nanndemoii",
  };
  //console.log(body);
  ajax_post(pass, body)
    .done(function(result) {
      //console.log("ok",result);
      floormap=result.floormap;
      create_table(result);
  })
  .fail(function(result) {
    console.log("ng", result);
  });
}
//フロアごと
function get_data() {
let pass = "mmms/"+path_post;
let body = {
  bukken: bukken_thispage,
};
ajax_post(pass, body)
  .done(function(result) {
    //console.log("ok",result);
    floormap=result.floormap;
    create_table(result);
  })
  .fail(function(result) {
    console.log("ng", result);
  });
}

function create_table(obj) {

let header="";
let body="";
if(obj.arr_gyosha){
  //業者ごと
  header = table_header_g(obj.arr_floor);
  body = table_body_g(obj);
}else{
  //フロアごと
  header = table_header();
  body = table_body(obj);
}

let txt = "";
txt +='<table class="fixheader" style="display: none; position: fixed; top: 0;">';
txt += "<thead><tr>" + header + "</tr></thead>";
txt += "</table>";
txt += '<table class="sheet" width="100%">';
txt += "<thead><tr>" + header + "</tr></thead>";
txt += '<tbody id="tbody">' + body + "</tbody>";
txt += "</table>";

$("#content").append(txt);

table_header_fixed(); //表ヘッダー固定
activate_modal(); //モーダル
}
function table_header() {
let txt=""
txt+='<th width="20%">floor</th>';
txt+='<th width="80%">device</th>';
return txt;
}
function table_header_g(af) {
const width_gyosha=15;
let per=(100-width_gyosha)/af.length;
//console.log(af,per);
let txt=""
txt+='<th width="'+width_gyosha+'%">業者</th>';
af.forEach(function (floor) {
  txt+='<th width="'+per+'%">'+floor+'</th>';
});
return txt;
}
function table_body(obj) {
  obj.arr_floor.reverse();//配列を反対にする
  //console.log(obj);
  let t = "";

  obj.arr_floor.forEach(function (floor) {
    let fm=obj.floormap[floor];
    let dev="";
    let n=0;
    fm.forEach(function (w) {
      let st=w.state;
      let id=w.id;
      let name=w.device.name;
      dev+='<input type="button" class="'+st+'" id="'+id+'" value="'+name+'" onclick=\'modal_open("'+floor+'",'+n+')\'>';
      n++;

      create_modal(w);//1個ずつモーダルを作る

    });

    t +='<tr>';
    t +='<td>'+floor+'</td>';
    t +='<td>'+dev+'</td>';
    t += "</tr>";
  });

  return t;
}
function table_body_g(obj) {
let t = "";

obj.arr_gyosha.forEach(function (gyosha_id) {
  t+='<tr>';
  t +='<td>'+obj.gyosha_idname[gyosha_id]+'</td>';
  obj.arr_floor.forEach(function (floor) {
    let fm=obj.floormap[gyosha_id][floor];
    //console.log(fm);
    let dev="";
    let n=0;
    fm.forEach(function (w) {
      let st=w.state;
      let id=w.id;
      let name=w.device.name;
      dev+='<input type="button" class="'+st+'" id="'+id+'" value="'+name+'" onclick=\'modal_open("'+floor+'","'+n+'","'+gyosha_id+'")\'>';
      
      create_modal(w);//1個ずつモーダルを作る
      n++;
    });
    t +='<td>'+dev+'</td>';
  });
  t += "</tr>";
});

return t;
}

///////////////////モーダル///////////////////
function create_modal(w) {
let txt = "";
txt += '<div id="modal-' + w.id + '" class="modal js-modal">';
txt += '<div class="modal__bg js-modal-close"></div>';
txt += '<div class="modal__content">';
txt += '<div class="gazo" id="gazo-' + w.id + '">';
txt += "</div>";
txt += '<a class="js-modal-close" href="">close</a></div></div>';
$("#content_modal").append(txt);
}
function activate_modal() {
$(".js-modal-close").on("click", function() {
  $(".js-modal").fadeOut();
  $(".gazo").empty();
  return false;
});
}
function modal_open(f,n,gid) {
console.log(f,n,gid);
let obj;
if(gid){
  obj=floormap[gid][f][n];
}else{
  obj=floormap[f][n];
}
//console.log(obj);
//https://d2r6wyz4d4typa.cloudfront.net/activeapp/mmms/kss.png
let curl="https://d2r6wyz4d4typa.cloudfront.net/activeapp/mmms/";
let txt ='<img class="back" src="'+curl+bukken_thispage+"/"+f+'.png">';
//console.log(txt);
//自分のポイントプロット
let url_redpoint=curl+"point_red.png";
myz = obj.map.zahyo;
//console.log(myz);

txt += '<div id="mypoint">';
txt += '<img class="point blinking" id="p1" src="'+url_redpoint+'">';
let myname = obj.device.name;
txt +='<p class="pointmoji" id="p2" style="background-color:white;">'+myname+"</p>";
txt += "</div>";
//console.log(txt);
//console.log("#gazo-" + obj.id);

$("#gazo-" + obj.id).html(txt);

setpoint(myz[0], myz[1]); //ポイントの座標

let m = "#modal-" + obj.id;
$(m).fadeIn();
return false;
}
function setpoint(x, y) {
$("#p1").css({ top: y + "%", left: x + "%" });
$("#p2").css({ top: y + 9 + "%", left: x + "%" });
}

///////////////////その他function///////////////////
//table ヘッダー固定
function table_header_fixed() {
var tableSheet = $("table.sheet");
//var offset = tableSheet.offset();
$(".fixheader").width(tableSheet.width());

$(window).scroll(function() {
  if (
    $(window).scrollTop() > tableSheet.offset().top &&
    $(window).scrollTop() < tableSheet.offset().top + tableSheet.height()
  ) {
    var fixheaderTop = $(window).scrollTop();
    $(".fixheader").show();
  } else {
    $(".fixheader").hide();
  }
});
$(window).resize(function() {
  $(".fixheader").width(tableSheet.width());
});
}
