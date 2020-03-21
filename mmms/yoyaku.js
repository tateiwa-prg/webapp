$(document).ready(function() {

    //gw node tag 判定
    let pi=getParam("pi");
    let a_pi=pi.split(kgr);
    bukken_thispage=localStorage.getItem("mmms_nowbukken");
    type_thispage=a_pi[a_pi.length-1];

    get_set_gyosha();
});

var bukken_thispage;
var type_thispage;

var list_gyosha;
var list_dev;

var gyosha_key;
var device_key;

function get_set_gyosha(){

    let pass="../mmms/get-set";
    let body={
        type:"gyosha",
        bukken:bukken_thispage
    };
    ajax_post(pass,body).done(function(result) {
        console.log("ok",result);
        list_gyosha=result;
        get_set_dev();
    }).fail(function(result) {
        console.log("ng",result);
    });
}


function get_set_dev(){

    let pass="../mmms/get-set";
    let body={
        type:"device",
        bukken:bukken_thispage
   };
    ajax_post(pass,body).done(function(result) {
        //console.log("ok",result);
        list_dev=result;

        gyosha_key=arr_to_key(list_gyosha);
        device_key=arr_to_key(list_dev);
        console.log("gyosha_key",gyosha_key);
        console.log("device_key",device_key);

        create_list();
    }).fail(function(result) {
        console.log("ng",result);
    });
    
}


function create_list(){

    let txt='<div id="yoyaku_cont">';
    let arulist={};
    Object.keys(gyosha_key).forEach(function (key) {
        let val=JSON.parse(gyosha_key[key].val.S);
        txt+='<ul id="sortable1" class="connectedSortable" name="gname-'+key+'">'+val.name;

        let gyosha_devid=val.devid;
        console.log(gyosha_devid);
        if(gyosha_devid){
            gyosha_devid.forEach(function (w2) {
                if(device_key[w2]){
                    let val_dev=JSON.parse(device_key[w2].val.S);
                    txt+='<li id="node-'+w2+'" class="ui-state-default">&emsp;&emsp;'+val_dev.name+'</li>';
                    arulist[w2]=true;
                }
            });
        }
        txt+='</ul>';
    });
    txt+='<ul id="sortable2" class="connectedSortable" name="gname-unnamed">未使用';
    Object.keys(device_key).forEach(function (key) {
        let v=JSON.parse(device_key[key].val.S);
        if(!arulist[key]){
            txt+='<li id="node-'+key+'" class="ui-state-default">&emsp;&emsp;'+v.name+'</li>';
        }
    });
    txt+='</ul>';
    txt+='</div>'

    //console.log(arulist);
    $('#content').html(txt);

    ddstart();

}

function arr_to_key(arr){
    let res={};
    arr.forEach(function (w) {
        let key=w.id.N;
        res[key]=w;
    });
    //console.log(res);
    return res;
}

//ドラッグandドロップ
var drag_start_name="";
function ddstart(){
    $( function() {
        $( "#sortable1, #sortable2" ).sortable({
            connectWith: ".connectedSortable",
        start: function() {
            drag_start_name=$(this).attr('name');
            //console.log($(this).attr('name'));
            //console.log("dragged!");
        },
        receive: function(event,ui) {
            //console.log("dropped!");
            //console.log("ドロップ先業者=",$(this).attr('name'));
            //console.log(drag_start_name,$(this).attr('name'),ui.item[0].id);
            //console.log("id=",ui.item[0].id);
            //put_dragset($(this).attr('name'),ui.item[0].id);
            //console.log((drag_start_name).slice(6),($(this).attr('name')).slice(6),(ui.item[0].id).slice(5))
            yoyaku((drag_start_name).slice(6),($(this).attr('name')).slice(6),(ui.item[0].id).slice(5))
        },
      }).disableSelection();
    });
}


//予約
function yoyaku(gyosha_id_1,gyosha_id_2,devid){
    console.log(gyosha_id_1,gyosha_id_2,devid);

    if(gyosha_id_1!="unnamed"){
        let res_cut=gyosha_key[gyosha_id_1];
        let val_cut=JSON.parse(res_cut.val.S);
        let w = val_cut.devid.filter(function( item ) {
            return item != devid;
        });
        val_cut.devid=w;
        res_cut.val.S=JSON.stringify(val_cut);
        //console.log(res_cut);
        post_request(res_cut);
    }

    if(gyosha_id_2!="unnamed"){
        let res_plus=gyosha_key[gyosha_id_2];
        let val_plus=JSON.parse(res_plus.val.S);
        console.log(val_plus,val_plus.devid);
        if(!val_plus.devid){
            val_plus.devid=[];
        }
        //console.log(val_plus,val_plus.devid,val_plus.devid.length);
        val_plus.devid[val_plus.devid.length]=devid;
        //console.log(val_plus,val_plus.devid);
        
        res_plus.val.S=JSON.stringify(val_plus);
        //console.log(res_plus);
        
        post_request(res_plus);
    }

}



function post_request(body){
    let pass="../mmms/putdelete-set";

    pprm={
        method: "put",
        item: body,
    }

    ajax_post(pass,pprm).done(function(result) {
        //console.log("ok",result);
        console.log("ok");
        //alert("更新しました");
        //location.reload();
    }).fail(function(result) {
        console.log("ng",result);
        alert("失敗しました");
        location.reload();
   });

}

