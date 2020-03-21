$(document).ready(function() {

});


function dl_csv(){
    let are=[$('input[name="sensor"]:checked').val()];
    
    if(!are[0]){
        alert("センサーを選んでください");
        return false;
    }

    //期間
    let dtl0=$("#dtl0").val();
    let dtl1=$("#dtl1").val();
    let nd0=new Date(dtl0);
    let nd1=new Date(dtl1);
    let time0=nd0.getTime();
    let time1=nd1.getTime();
    let def=(time1-time0)/1000/60/60/24;//日
    if(def>31){
        alert("期間を短くしてください");
        return false;
    }
    let dtset={
        dtl0:dtl0,
        dtl1:dtl1,
    }

    let timeJP0=unix2timeJP(time0/1000);
    let timeJP1=unix2timeJP(time1/1000);
        
    let prm={
        kikan:{
            from:timeJP0.year+"/"+timeJP0.month+"/"+timeJP0.day+" "+timeJP0.hour+":"+timeJP0.minute,
            to:timeJP1.year+"/"+timeJP1.month+"/"+timeJP1.day+" "+timeJP1.hour+":"+timeJP1.minute,
        },
        sensor:are
    }
    //console.log(prm);

    let pass="lorath/get-sensor-data";
    ajax_post(pass,prm).done(function(result) {
        //console.log("ok",result);
        let err=result.errorMessage;
        if(err){
            alert(err);
            return false;
        }
        let sname=$('input[name="sensor"]:checked').parent().text();
        let filename=sname+"_"+dtset.dtl0+"_"+dtset.dtl1+".csv";
        console.log(filename);
        /*
        let arr=[
            ['row 1 / cell 1', 'row 1 / cell 2', 'row 1 / cell 3'], 
            ['row 2 / cell 1', 'row 2 / cell 2'], 
            ['row 3 / cell 1', 'row 3 / cell 2', 'row 3 / cell 3', 'row 3 / cell 4']
        ];
        */
        let array=seikei_csv(result[are[0]]);
        //console.log(array);
        downloadArrayAsCsv(array,filename);
    }).fail(function(result) {
        console.log("ng",result);
    });

}

//csv整形
function seikei_csv(obj){

    let res=[];
    res[0]=["日時","温度","湿度"];
    let n=0;
    //console.log(obj);
    obj.db.forEach(function (arr) {
        let w=unix2timeJP((new Date(arr.x)).getTime()/1000);
        let nichiji=w.year+"/"+w.month+"/"+w.day+" "+w.hour+":"+w.minute+":"+w.second;
        let db=arr.y;
        let rh=obj.rh[n].y;
        res[n+1]=[
            [nichiji,db,rh]
        ]
        n++;
    });

    return res;
}

//csvダウンロード
function downloadArrayAsCsv(array, fileName) {
    var UTF_8_BOM = '%EF%BB%BF';
    var csv = [];
 
    array.forEach(function (row, index) {
        csv.push(row.join(','));
    });
 
    csv = csv.join('\n');
    var data = 'data:text/csv;charset=utf-8,' + UTF_8_BOM + encodeURIComponent(csv);
    var element = document.createElement('a');
    element.href = data;
    element.setAttribute('download', fileName);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function unix2timeJP(unix){
    let timeJP = new Date((unix)*1000);
    let res={
        "year":""+timeJP.getFullYear(),
        "month" : ("0"+(timeJP.getMonth()+1)).slice(-2),
        "day" : ("0"+timeJP.getDate()).slice(-2),
        "hour" : ("0"+timeJP.getHours()).slice(-2),
        "minute" : ("0"+timeJP.getMinutes()).slice(-2),
        "second" : ("0"+timeJP.getSeconds()).slice(-2)
    };
    return res;
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
  