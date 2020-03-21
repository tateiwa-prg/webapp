$(document).ready(function() {

  //gw node tag 判定
  let pi=getParam("pi");
  let a_pi=pi.split(kgr);
  bukkenn_thispage=localStorage.getItem("mmms_nowbukken");
  type_thispage=a_pi[a_pi.length-1];
  b_t=bukkenn_thispage+"#"+type_thispage;
  console.log(bukkenn_thispage,type_thispage,b_t);

  //センサー情報
  get_data();

});
var bukkenn_thispage;
var type_thispage;
var b_t;//物件-type


function get_data(){

  let pass="../mmms/get-set";
  let body={
    type:type_thispage,
    bukken:bukkenn_thispage,
  };
  ajax_post(pass,body).done(function(result) {
    //console.log("ok",result);
    create_table(result);
  }).fail(function(result) {
    console.log("ng",result);
  });
  
}
function create_table(obj){
  let header=table_header();
  let body=table_body(obj);
  let txt="";
  txt+='<table class="fixheader" style="display: none; position: fixed; top: 0;">';
  txt+='<thead><tr>'+header+'</tr></thead>';
  txt+='</table>';
  txt+='<table class="sheet" width="100%">';
  txt+='<thead><tr>'+header+'</tr></thead>';
  txt+='<tbody id="tbody">'+body+'</tbody>';
  txt+='</table>';
  $('#content').html(txt);
  table_header_fixed();
}
function table_body(obj){
  let t="";
  obj.forEach(function (w) {
    let adrs=get_add(w.bukken_add.S);
    let id='<input type="number" id="id-'+w.id.N+'" max="9999" value="'+w.id.N+'">';
    let add='<input type="text" id="add-'+w.id.N+'" value=\''+adrs+'\'>';
    let val='<input type="text" id="val-'+w.id.N+'" value=\''+w.val.S+'\'>';
    let btn='<input type="button" class="pact" id="put-'+w.id.N+'" value="修正" onclick=\'request_set('+w.id.N+',"put")\'>';
    btn+='<input type="button" class="pact" id="delete-'+w.id.N+'" value="消去" onclick=\'request_set('+w.id.N+',"delete")\'>';
    
    t+='<tr>';
    t+='<td>'+id+'</td>';
    t+='<td>'+add+'</td>';
    t+='<td>'+val+'</td>';
    t+='<td>'+btn+'</td>';
    t+='</tr>';
  });
  //追加用の行
  t+='<tr>';
  t+='<td><input type="number" id="id-10000" max="9999"></td>';
  t+='<td><input type="text" id="add-10000"></td>';
  t+='<td><input type="text" id="val-10000" value=\''+global_shoki[type_thispage]+'\'></td>';
  t+='<td><input type="button" class="pact" id="put-10000" value="追加" onclick=\'request_set(10000,"put")\'></td>';
  t+='</tr>';
  return t;
}
/////////////////////////tableのglobal編集/////////////////////////////////
function table_header(){
  let w='<th width=10%">ID</th>';
  w+='<th width=20%">アドレス</th>';
  w+='<th width=30%">値</th>';
  w+='<th width=20%"></th>';
  return w;
}
var global_shoki={
  gw:'{"blank":""}',
  floor:'{"floor":["1F","2F"]}',
  map:'{"name":"map name x"}',
  device:'{"name":"dev name x"}',
}
/////////////////////////tableのglobal編集/////////////////////////////////

function get_add(moji){
  let arr = moji.split("#");
  return arr[1];
}
function request_set(n,method){
  //console.log(type,n,method);
  let id=$('#id-'+n).val();
  //console.log(id);
  if(id){
      let pprm={};
      if(method=="put"){
          pprm={
              method: method,
              item: {
                type: {S: type_thispage},
                bukken_add: {S: bukkenn_thispage+"#"+$('#add-'+n).val()},
                id: {N: id},
                val: {S: $('#val-'+n).val()},
              }
          }
      }else{
          pprm={
              method: method,
              item: {
                type: {S: type_thispage},
                bukken_add: {S: bukkenn_thispage+"#"+$('#add-'+n).val()},
              }
          }
      }
      console.log(pprm);
      post_request(pprm);
  }else{
      alert("IDを選択して追加してください")
  }
}
function post_request(body){
  let pass="../mmms/putdelete-set";
  ajax_post(pass,body).done(function(result) {
      console.log("ok",result);
      alert("更新しました");
      location.reload();
  }).fail(function(result) {
      console.log("ng",result);
      alert("失敗しました");
      location.reload();
 });

}


