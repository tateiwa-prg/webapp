/**
 * 画面読み込み時の処理
 */
//var pathname_arr=[];
//var pn="";//1個目のpath
$(document).ready(function() {
  everytime();
});
var kgr="x$t"//区切り文字

function getParam(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

//table ヘッダー固定
function table_header_fixed(){
  var tableSheet = $('table.sheet');
  //var offset = tableSheet.offset();
  $('.fixheader').width(tableSheet.width());

  $(window).scroll(function () {
      if($(window).scrollTop() > tableSheet.offset().top
      && $(window).scrollTop() < (tableSheet.offset().top + tableSheet.height() ) ) {
          var fixheaderTop = $(window).scrollTop();
          $('.fixheader').show();
      } else {
          $('.fixheader').hide();
      }
  });
  $(window).resize(function() {
      $('.fixheader').width(tableSheet.width());
  });
}


function everytime(){
  let autho = JSON.parse(localStorage.getItem("autho"));
  let menumap = JSON.parse(sessionStorage.getItem("menumap"));
  if(autho){
    $("#usertext").text(autho.user);
    if(menumap){
      //console.log("display menu");
      display_menu();
    }else{
      //認証
      console.log("ninshou");
      confirm_user(autho);
    }
  }else{
    $(location).attr("href", "./?pi=s");//ユーザー情報がない場合はサインイン画面へ
  }
  
}

function confirm_user(body) {
  let pass_autho = "autho";
  ajax_post(pass_autho, body)
    .done(function(result) {
      //console.log("ok", result);
      if (!result.autho) {
        $(location).attr("href", "./?pi=s");
      }
      sessionStorage.setItem("menumap", JSON.stringify(result.menumap));
      sessionStorage.setItem("mmms_bukken", JSON.stringify(result.mmms_bukken));
      console.log("display menu");
      display_menu();
    })
    .fail(function(result) {
      console.log(result);
      $(location).attr("href", "./?pi=s");
  });
}

function display_menu(){
  //見ていいメニューか確認

  
  //メニューの表示
  let pi=getParam("pi");
  console.log(pi);
  let menumap = JSON.parse(sessionStorage.getItem("menumap"));
  if(!pi){
    //メイン画面のメニューを表示
    mainmenu(menumap.menu.M);
    create_menu();
  }else{
    let a_pi=pi.split('x$t');
    create_menu(a_pi[0]);

    //mmmsの場合はbukken情報も
    if(a_pi[0]=="mmms"){
      mmmsbukken();
    }
  }

}

function mmmsbukken(){
  let mmms_bukken = JSON.parse(sessionStorage.getItem("mmms_bukken"));
  let mmms_nowbukken = localStorage.getItem("mmms_nowbukken");
  //console.log(mmms_bukken,mmms_nowbukken);

  let txt='<select name="select_mmms_bukken">';
  Object.keys(mmms_bukken).forEach(function(key) {
    let ed="";
    if(key==mmms_nowbukken){
      ed="selected";
    }
    txt+='<option value="'+key+'"'+ed+'>'+mmms_bukken[key].S+'</option>'
  });
  txt+='</select>';

  $("#bukkentext").html(txt);
  let nb=$("select[name=select_mmms_bukken]").val();
  //console.log(nb);
  localStorage.setItem("mmms_nowbukken",nb)

  select_mmms_bukken_change();//変更監視
}
function select_mmms_bukken_change(){
  $("select[name=select_mmms_bukken]").change(function() {
    let bs=$(this).val();
    //console.log(bs);
    localStorage.setItem("mmms_nowbukken",bs)
    location.reload();
  });
}

function mainmenu(m){
  let txt="";
  txt+='<div id="menu">';
  txt+="<h1>システム選択</h1>";
  txt+="<p>↓↓↓↓↓どれか選択↓↓↓↓↓</p>";
  txt+="<fieldset>";
  Object.keys(m).forEach(function(key) {
    txt+='<input id="'+key+'" value="'+key+'" class="radio-inline__input" type="radio" name="radio-1">';
    txt+='<label class="radio-inline__label" for="'+key+'">'+m[key].M.name.S+'</label>';
    //console.log(key);
  });
  txt+="</fieldset>";
  txt+='</div>';
  $("#content").html(txt);
  radio1_change();
}
//変更監視
function radio1_change(){
  $("input:radio[name=radio-1]").change(function() {
    let radio1=$('input[name=radio-1]:checked').val();
    console.log(radio1);
    create_menu(radio1);
  });
}

//menuを作る
function create_menu(pn) {
  //セッションにメニューがあるはず
  let menumap = JSON.parse(sessionStorage.getItem("menumap"));
  //console.log(menumap);
  let cpn = "";
  cpn += "<ul>";
  cpn += '<li><a href="./">メニュー</a></li>';
  if (pn) {
    let w = menumap.menu.M[pn].M.menu.M;
    //console.log(w);
    Object.keys(w).forEach(function(key) {
      //console.log(key,w[key].M.name.S);
      cpn += "<li>";
      if (w[key].M.menu) {
        //console.log("メニューまだあり");
        cpn +=
          '<a href="#">' + w[key].M.name.S + '<span class="caret"></span></a>';
        cpn += "<div><ul>";
        let w2 = w[key].M.menu.M;
        Object.keys(w2).forEach(function(key2) {
          //console.log(key2,w2[key2].M.name.S);
          cpn +='<li><a href="./?pi='+pn+kgr+key+kgr+key2+'">'+w2[key2].M.name.S+"</a></li>";
        });
        cpn += "</ul></div>";
      } else {
        //console.log("メニューもうなし");
        cpn +='<a href="./?pi='+pn+kgr+key+'">'+w[key].M.name.S+"</a>";
      }
      cpn += "</li>";
    });
  }

  cpn += '<li><a href="./?pi=s">サインアウト</a></li>';
  cpn += "</ul>";
  $(".cp_navi").html(cpn);

  //mmmsの場合のnow物件処理
  /*
  if (pn == "mmms") {
    nowbukken();
  }
  */
}

//権限で見れるページかどうか
function can_look(map, arr_path) {
  
  let ap = []; //検索対象配列
  let n = 0;
  arr_path.forEach(function(moji) {
    if (n > 0) {
      ap[n - 1] = moji;
    }
    n++;
  });
  ap[ap.length - 1] = ap[ap.length - 1].slice(0, -5);
  //console.log(map,ap);

  //mapの中にap配列があるかどうか
  let nai = false;
  ap.forEach(function(moji) {
    if (map.indexOf(moji) == -1) {
      //console.log(moji);
      nai = true;
    }
  });

  if (nai) {
    alert("権限がありません");
    $(location).attr("href", "./?pi=s");
  }
}



//ajax通信 GET
function ajax_get(pass) {
  return $.ajax({
    contentType: "application/json",
    dataType: "json",
    type: "GET",
    url: pass
  });
}
//ajax通信 POST
function ajax_post(pass, body) {
  return $.ajax({
    contentType: "application/json",
    data: JSON.stringify(body),
    dataType: "json",
    type: "POST",
    url: pass
  });
}
