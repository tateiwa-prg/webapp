$(document).ready(function(){


    change_checkbox();
    initial_sensor_set();

    koshin_check();

    drawchart();

})

//////////////////////描画パラメータ//////////////////////
//色
var backgroundColor=[
    "rgba(255,165,0,0.4)",
    "rgba(255,0,255,0.4)",
    "rgba(0,255,0,0.4)",
    "rgba(0,0,255,0.4)",
    "rgba(0,0,0,0.4)",
    "rgba(128,0,0,0.4)",
    "rgba(128,128,0,0.4)",
    "rgba(192,192,192,0.4)",
    "rgba(255,0,0,0.4)",
    "rgba(0,128,0,0.4)",
    "rgba(0,0,128,0.4)",
    "rgba(255,255,0,0.4)",
    "rgba(0,255,255,0.4)",
    "rgba(128,128,128,0.4)",
    "rgba(128,0,128,0.4)",
    "rgba(0,128,128,0.4)",
];
var borderColor=color();
function color(){
    //console.log(obj);
    let m=0;
    let res=[];
    backgroundColor.forEach(function (arr) {
        //console.log(arr);
        res[m]=arr.slice(0, -2)+"7)";
        m++;
    });
    return res;
}
var label={};//ラベル
var myChart;
function drawchart(){
    let ctx = $('#myChart');
    myChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: []
        },
        options:{
            legend:{
                position:"right",
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        //min: new Date("2019/12/05 10:00:00"),
                        //max: new Date("2019/12/07 12:00:00"),
                        //unit: 'hour',
                        displayFormats:{
                            millisecond:'YY/MM/DD HH:mm:ss',
                            second:'YY/MM/DD HH:mm:ss',
                            minute:'YY/MM/DD HH:mm',
                            hour:'YY/MM/DD HH:mm',
                            day:'YY/MM/DD HH:mm',
                            week:'YY/MM/DD',
                            month:'YY/MM/DD',
                            quarter:'YY/MM/DD',
                            year:'YYYY/MM',
                        }, 
                    }
                }],
                yAxes: [{
                    id: 'y-axis-1',
                    type:"linear",
                    position: "left",
                    ticks: {
                        max: 30,
                        min: 20,
                    },
                },{
                    id: 'y-axis-2',
                    type:"linear",
                    position: "right",
                    gridLines:{
                        drawOnChartArea: false,
                    },
                    ticks: {
                        max: 60,
                        min: 30,
                    },
                }]
            },
            showLines: true, // 全てのデータセットで無効にします。
        }
    });    
}

//////////////////////function//////////////////////
//チェックボックス　変化取得
function change_checkbox(){
    $('input[class="sensor_select"]').change(function() {
        koshin_check();
    });
}
function koshin_check(){
        //チェックボックス取得
        let are=$('.sensor_select:checked').map(function() {
            return $(this).val();
        }).get();
        localStorage.setItem("lorath_sensor_set",JSON.stringify(are));
        sensor_set=are;

        let are2=$('.sensor_select:checked').map(function() {
            return $(this).parent('label').text();
        }).get();

        let m=0;
        are.forEach(function (v) {
            label[v]=are2[m];
            m++;
        });
        //console.log(label);
}

//センサー設定の初期値
function initial_sensor_set(){
    let sset=JSON.parse(localStorage.getItem("lorath_sensor_set"));
    //console.log(sset);
    if(sset){
        $('input:checkbox[class="sensor_select"]').val(sset);
        sensor_set=sset;
    }else{
        localStorage.setItem("lorath_sensor_set","[]");
    }
}

//軸の上下限値保存
function save_axis(){
    let axis={
        dbmin:$("#dbmin").val(),
        dbmax:$("#dbmax").val(),
        rhmin:$("#rhmin").val(),
        rhmax:$("#rhmax").val(),
    }
    myChart.options.scales.yAxes[0].ticks={
        min:Number(axis.dbmin),
        max:Number(axis.dbmax),
    }
    myChart.options.scales.yAxes[1].ticks={
        min:Number(axis.rhmin),
        max:Number(axis.rhmax),
    }

}
//doneボタン
function drawgraph(){
    save_axis();
    //期間
    let dtl0=$("#dtl0").val();
    let dtl1=$("#dtl1").val();
    let nd0=new Date(dtl0);
    let nd1=new Date(dtl1);
    let time0=nd0.getTime();
    let time1=nd1.getTime();
    let def=(time1-time0)/1000/60/60/24;//日
    if(def>10){
        alert("期間を短くしてください");
        return false;
    }
    let timeJP0=unix2timeJP(time0/1000);
    let timeJP1=unix2timeJP(time1/1000);
    //チェックボックス取得
    let are=JSON.parse(localStorage.getItem("lorath_sensor_set"));

    let prm={
        kikan:{
            from:timeJP0.year+"/"+timeJP0.month+"/"+timeJP0.day+" "+timeJP0.hour+":"+timeJP0.minute,
            to:timeJP1.year+"/"+timeJP1.month+"/"+timeJP1.day+" "+timeJP1.hour+":"+timeJP1.minute,
        },
        sensor:are
    }
    //console.log(prm);
    let pass="../lorath/get-sensor-data";
    ajax_post(pass,prm).done(function(result) {
        //console.log("ok",result);
        redraw(result,nd0,nd1);
    }).fail(function(result) {
        console.log("ng",result);
    });

}
//グラフを描く部分
function redraw(obj,nd0,nd1){
    myChart.data.datasets=[];
    let n=0;
    Object.keys(obj).forEach(function (key) {
        let ok=obj[key];
        myChart.data.datasets[n]={
            data: ok.db,
            backgroundColor:backgroundColor[n],
            borderColor:borderColor[n],
            pointRadius:0,
            lineTension: 0,
            fill:false,
            label:label[key]+" 温度",
            yAxisID:"y-axis-1",
        };
        n++;
        myChart.data.datasets[n]={
            data: ok.rh,
            backgroundColor:backgroundColor[n],
            borderColor:borderColor[n],
            pointRadius:0,
            lineTension: 0,
            fill:false,
            label:label[key]+" 湿度",
            yAxisID:"y-axis-2",
        };
        n++;
    });
    /*
    Object.keys(obj).forEach(function (key) {
        let ok=obj[key];
        myChart.data.datasets[n]={
            data: ok.rh,
            backgroundColor:backgroundColor[n],
            borderColor:borderColor[n],
            pointRadius:0,
            lineTension: 0,
            fill:false,
            label:label[key]+" 湿度",
            yAxisID:"y-axis-2",
        };
        n++;
    });
    */
    //console.log(myChart.data.datasets);
    myChart.options.scales.xAxes[0].time.min=nd0;
    myChart.options.scales.xAxes[0].time.max=nd1;
    myChart.update();
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
