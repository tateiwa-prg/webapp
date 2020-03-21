$(document).ready(function() {
  //type 判定
  let pi = getParam("pi");
  let a_pi = pi.split(kgr);
  bukken_thispage = localStorage.getItem("mmms_nowbukken");
  let w = JSON.parse(sessionStorage.getItem("mmms_bukken"));
  nowbukken_JP = w[bukken_thispage].S;
  type_thispage = a_pi[a_pi.length - 1];
  b_t = bukken_thispage + "#" + type_thispage;
  console.log(bukken_thispage,type_thispage,b_t);

  //センサー情報
  if (type_thispage == "map") {
    get_floor();
  } else {
    get_data();
  }
});

var bukken_thispage;
var nowbukken_JP;
var type_thispage;
var b_t; //物件-type
var map_floor;
//var url_floormap={};
var val_memory = {}; //val記憶
var add_memory = {}; //val記憶

function get_floor() {
  let pass = "../mmms/get-set";
  let body = {
    type: "floor",
    bukken: bukken_thispage,
  };
  console.log(body);
  ajax_post(pass, body)
    .done(function(result) {
      //console.log("ok",result);
      if (result[0]) {
        let f = JSON.parse(result[0].val.S);
        //console.log(f);
        map_floor = f.floor;
        let n=0;
        f.floor.forEach(function(a) {
          //url_floormap[a]=f.url[n];
          n++;
        });
      } else {
        map_floor = [];
        //url_floormap={};
      }
      //console.log(url_floormap);
      get_data();
    })
    .fail(function(result) {
      console.log("ng", result);
    });
}
function get_data() {
  let pass = "../mmms/get-set";
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
  txt +=
    '<table class="fixheader" style="display: none; position: fixed; top: 0;">';
  txt += "<thead><tr>" + header + "</tr></thead>";
  txt += "</table>";
  txt += '<table class="sheet" width="100%">';
  txt += "<thead><tr>" + header + "</tr></thead>";
  txt += '<tbody id="tbody">' + body + "</tbody>";
  txt += "</table>";

  if (type_thispage == "gyosha") {
    txt +='<p>同じIDで追加すると、上書きされます</p>';
  }else if(type_thispage == "map"){
    txt +='<p>IDごとの修正を行うため、他IDの変更は無効となります</p>';
  }

  $("#content").html(txt);

  table_header_fixed(); //表ヘッダー固定

  if (type_thispage == "map") {
    create_modal(map_floor);
    activate_modal(); //モーダル
  }
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
    per: [20, 30, 30, 20],
    txt: ["ID", "GWアドレス", ""],
    val_id: ["gw_add"],
    val_type: ["text"],
    val_text_readonly: [""]
  },
  floor: {
    per: [20, 30, 30, 20],
    txt: ["ID", "物件", "フロア", ""],
    val_id: ["floor"],
    val_type: ["textarray"],
    val_text_readonly: ["readonly"]
  },
  map: {
    per: [10, 20, 10, 15, 10],
    txt: ["ID", "名称", "フロア", "座標", ""],
    val_id: ["name", "floor", "zahyo"],
    val_type: ["text", "select", "map"]
  },
  device: {
    per: [10, 15, 10],
    txt: ["ID", "名称", ""],
    val_id: ["name"],
    val_type: ["text"]
  },
  gyosha: {
    per: [10, 20, 10],
    txt: ["ID", "業者名", ""],
    val_id: ["name"],
    val_type: ["text"]
  }
};
/////////////////////////tableのglobal編集/////////////////////////////////
function table_body(obj) {
  let t = "";
  obj.forEach(function(w) {
    let id = w.id.N;
    val_memory[id] = JSON.parse(w.val.S);
    add_memory[id]=w.bukken_add.S;
    //console.log(val_memory[id]);

    t += "<tr>";
    t +=
      '<td><input type="number" id="id-' +
      id +
      '" max="9999" value=' +
      id +
      " readonly></td>";

    let nval = 0;
    global_prm[type_thispage].val_id.forEach(function(w2) {
      //console.log(w2);
      let v = val_memory[id][w2];
      let vt = global_prm[type_thispage].val_type[nval];
      //console.log(v,vt);
      if (vt == "text" || vt == "textarray") {
        t +=
          '<td><input type="text" id="' +
          w2 +
          "-" +
          id +
          '" value="' +
          v +
          '"></td>';
      } else if (vt == "map") {
        let text_a =
          '<input type="button" class="pact" id="mo-' +
          id +
          '" value="MAP" onclick="modal_open(' +
          id +
          ')">';
        t += "<td>" + text_a + "</td>";
      } else if (vt == "select") {
        t += "<td>" + create_select(w2, id, v) + "</td>";
      }
      nval++;
      /**/
    });

    t += "<td>";
    t +='<input type="button" class="pact" id="put-' +
      id + '" value="修正" onclick=\'request_set("'+ w.id.N +'","put")\'>';
    if (type_thispage == "gyosha") {
      t +=
        '<input type="button" class="pact" id="delete-' +
        id +'" value="削除" onclick=\'request_set("' +w.id.N +'","delete")\'>';
    }
    t += "</td>";

    t += "</tr>";
  });
  //console.log("valメモリ", val_memory);
  //console.log("addメモリ", add_memory);
  //追加用の行
  if (type_thispage == "gyosha") {
    t += "<tr>";
    t += '<td><input type="number" id="id-10000" max="9999"></td>';
    global_prm[type_thispage].val_id.forEach(function(w2) {
      t += '<td><input type="text" id="' + w2 + '-10000"></td>';
    });
    t +='<td><input type="button" class="pact" id="put-10000" value="追加" onclick=\'request_set(10000,"put")\'></td>';
    t += "</tr>";
  }

  return t;
}
function create_select(valid, n, valm) {
  //console.log(valid,n,valm);
  let txt = '<select id="' + valid + "-" + n + '">';
  map_floor.forEach(function(floor) {
    if (valm == floor) {
      txt += '<option value="' + floor + '" selected>' + floor + "</option>";
    } else {
      txt += '<option value="' + floor + '">' + floor + "</option>";
    }
  });
  txt += "</select>";
  return txt;
}

function request_set( n, method) {
  //console.log(type,n,method);
  let id = $("#id-" + n).val();
  //console.log(id);
  if (id) {
    //gyoshaの物件アドレスがない場合の対応
    let add=add_memory[id];
    if(!add){
      add=bukken_thispage+"#"+id;
    }
    let pprm = {};
    if (method == "put") {
      let val = prm_putval(n);
      pprm = {
        method: method,
        item: {
          id: { N: id },
          type: { S: type_thispage },
          val: { S: JSON.stringify(val) },
          bukken_add:{S:add},
        }
      };
    } else {
      //deleteはないはず
      pprm = {
        method: method,
        item: {
          bukken_add:{S:add},
          type: { S: type_thispage }
        }
      };
    }
    //console.log(pprm);
    post_request(pprm);
  } else {
    alert("IDを選択して追加してください");
  }
}
function prm_putval(n) {
  let putval = val_memory[n];
  if (!putval) {
    putval = {};
  }
  let num = 0;
  global_prm[type_thispage].val_id.forEach(function(w2) {
    let v = $("#" + w2 + "-" + n).val();
    let vt = global_prm[type_thispage].val_type[num];
    //console.log(vt,v,w2);
    if (vt == "text" || vt == "select") {
      putval[w2] = v;
      //console.log(putval)
    } else if (vt == "textarray") {
      if (v.length > 0) {
        putval[w2] = v.split(",");
      } else {
        putval[w2] = [];
      }
    } else if (vt == "map") {
      let z = val_memory[n].zahyo;
      if (z) {
        putval[w2] = z;
      } else {
        putval[w2] = [50, 50];
      }
    }
    num++;
  });
  //console.log(putval);
  return putval;
}
function post_request(body) {
  let pass = "../mmms/putdelete-set";
  ajax_post(pass, body)
    .done(function(result) {
      console.log("ok", result);
      alert("更新しました");
      location.reload();
    })
    .fail(function(result) {
      console.log("ng", result);
      alert("失敗しました");
      location.reload();
    });
}
function create_modal(arr_floor) {
  let txt = "";
  arr_floor.forEach(function(floor) {
    txt += '<div id="modal-' + floor + '" class="modal js-modal">';
    txt += '<div class="modal__bg js-modal-close"></div>';
    txt += '<div class="modal__content">';

    txt +=
      '<input type="button" class="pact2" value="👈" onclick="yajirushi(-2,0)">';
    txt +=
      '<input type="button" class="pact2" value="👆" onclick="yajirushi(0,-2)">';
    txt +=
      '<input type="button" class="pact2" value="👇" onclick="yajirushi(0,2)">';
    txt +=
      '<input type="button" class="pact2" value="👉" onclick="yajirushi(2,0)">';

    txt += '<div class="gazo" id="gazo-' + floor + '">';

    txt += "</div>";
    txt += '<a class="js-modal-close" href="">close</a></div></div>';
  });
  $("#content_modal").html(txt);
}
function activate_modal() {
  $(".js-modal-close").on("click", function() {
    $(".js-modal").fadeOut();
    $(".gazo").empty();
    return false;
  });
}
function yajirushi(dx, dy) {
  let z = val_memory[num_point_now].zahyo;
  val_memory[num_point_now].zahyo = [z[0] + dx, z[1] + dy];
  console.log(val_memory[num_point_now].zahyo, val_memory[num_point_now].name);
  let myz = val_memory[num_point_now].zahyo;
  $("#p1").css({ top: myz[1] + "%", left: myz[0] + "%" });
  $("#p2").css({ top: myz[1] + 9 + "%", left: myz[0] + "%" });
}
var num_point_now = 0; //現在捜査中ポイント番号
function modal_open(n) {
  $("#mo-" + n).css("background-color", "orange");
  let this_floor = $("#floor-" + n).val();
  //console.log(this_floor);
  //let curl="https://cdn.glitch.com/20111f77-be78-4545-b7c8-f2f792a993c9%2F";
  //let txt ='<img class="back" src="'+curl+url_floormap[this_floor]+'">';
  let curl="https://d2r6wyz4d4typa.cloudfront.net/activeapp/mmms/";
  let txt='<img class="back" src="'+curl+bukken_thispage+"/"+this_floor+".png"+'">';

  //自分以外のポイントプロット
  //let url_bluepoint="https://cdn.glitch.com/20111f77-be78-4545-b7c8-f2f792a993c9%2Fpoint_blue.png?v=1583807266034";
  let url_bluepoint=curl+"point_blue.png"
  Object.keys(val_memory).forEach(function(key) {
    let vm = val_memory[key];
    let f = vm.floor;
    console.log(this_floor, f, n, key);
    if (this_floor == f && n != key) {
      let z = vm.zahyo;
      //console.log(z);
      txt +='<img class="point" src="'+url_bluepoint+'" style="top:' +z[1] +"%; left:" +z[0] +'%;">';
      txt +='<p class="pointmoji" style="top:' +(z[1] + 9) +"%; left:" +z[0] +'%; background-color:white;">' +val_memory[key].name +"</p>";
    }
  });
  //自分のポイントプロット
  //let url_redpoint="https://cdn.glitch.com/20111f77-be78-4545-b7c8-f2f792a993c9%2Fpoint_red.png?v=1583807254568";
  let url_redpoint=curl+"point_red.png"

  num_point_now = n;
  console.log(num_point_now);
  if (!val_memory[n].zahyo) {
    val_memory[n].zahyo = [45, 45];
  }
  myz = val_memory[n].zahyo;

  console.log(myz);
  txt += '<div id="mypoint">';
  //txt+='<img class="point" id="p1" src="../map/point_red.png" style="top:'+myz[1]+'%; left:'+myz[0]+'%;">';
  txt += '<img class="point" id="p1" src="'+url_redpoint+'">';
  let myname = $("#name-" + n).val();
  //txt+='<p class="point" id="p2" style="top:'+(myz[1]+9)+'%; left:'+myz[0]+'%; background-color:white;">'+myname+'</p>';
  txt +=
    '<p class="pointmoji" id="p2" style="background-color:white;">' +
    myname +
    "</p>";
  txt += "</div>";

  //console.log(txt);
  $("#gazo-" + this_floor).html(txt);

  yajirushi(0, 0); //ポイントの座標

  let m = "#modal-" + this_floor;
  //console.log(this_floor,m);
  $(m).fadeIn();
  return false;
}

