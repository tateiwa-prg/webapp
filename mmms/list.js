$(document).ready(function() {
    //type 判定
    let pi = getParam("pi");
    let a_pi = pi.split(kgr);
    bukken_thispage = localStorage.getItem("mmms_nowbukken");
    let w = JSON.parse(sessionStorage.getItem("mmms_bukken"));
    nowbukken_JP = w[bukken_thispage].S;
    type_thispage = a_pi[a_pi.length - 1];
    console.log(bukken_thispage,type_thispage);

    //センサー情報
    get_data();
});

var bukken_thispage;
var nowbukken_JP;
var type_thispage;

function get_data() {
  let pass = "../mmms/get-listdata";
  let body = {
    type: type_thispage,
    bukken: bukken_thispage,
  };
  ajax_post(pass, body)
    .done(function(result) {
      //console.log("ok",result);
      create_table(result);
    })
    .fail(function(result) {
      console.log("ng", result);
    });
}

function create_table(obj) {
  let header = table_header(type_thispage);
  let body = table_body(obj);

  let txt = "";
  txt +='<table class="fixheader" style="display: none; position: fixed; top: 0;">';
  txt += "<thead><tr>" + header + "</tr></thead>";
  txt += "</table>";
  txt += '<table class="sheet" width="100%">';
  txt += "<thead><tr>" + header + "</tr></thead>";
  txt += '<tbody id="tbody">' + body + "</tbody>";
  txt += "</table>";

  $("#content").html(txt);

  table_header_fixed(); //表ヘッダー固定

}
function table_header(t) {
  let arr = global_prm;
  let w = "";
  let n = 0;
  arr[t].per.forEach(function(aa) {
    w += "<th width=" + arr[t].per[n] + '%">' + arr[t].txt[n] + "</th>";
    n++;
  });
  return w;
}
/////////////////////////tableのglobal編集/////////////////////////////////
var global_prm = {
  gw: {
    per: [5, 15, 20, 60],
    txt: ["ID", "アドレス", "日時","生データ"],
  },
  map: {
    per: [5, 15, 20, 60],
    txt: ["ID", "アドレス", "日時","生データ"],
  },
  device: {
    per: [5, 15, 20, 60],
    txt: ["ID", "アドレス", "日時","生データ"],
  },
};
/////////////////////////tableのglobal編集/////////////////////////////////
function table_body(obj) {
    let t = "";
    Object.keys(obj).forEach(function(key) {
        let v=obj[key];
        t +='<tr>';
        t +='<td>'+key+'</td>';
        t +='<td>'+v.add+'</td>';
        t +='<td>'+v.datetime+'</td>';
        t +='<td style="text-align:left;">'+v.sdata+'</td>';
        t += "</tr>";
    });
    return t;
}

