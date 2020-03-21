
$(document).ready(function(){

    saishin();

    //マウスホイールのイベント取得
    $(function(){
        var mousewheelevent = 'onwheel' in document ? 'wheel' : 'onmousewheel' in document ? 'mousewheel' : 'DOMMouseScroll';
        //console.log(mousewheelevent);
        //$(document).on(mousewheelevent,function(e){
        $(".kukisen-container").on(mousewheelevent,function(e){
                e.preventDefault();
            var delta = e.originalEvent.deltaY ? -(e.originalEvent.deltaY) : e.originalEvent.wheelDelta ? e.originalEvent.wheelDelta : -(e.originalEvent.detail);
            if (delta<0){
                unixJP+=prm_span_min*60;
            } else {
                unixJP-=prm_span_min*60;
            }
            //console.log(unixJP);
            change_hyoji_nichiji(unixJP);
            plot_main();
        });
    });

   //要素大きさ変更監視
   const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
            // 変更を検知した要素
            //console.log(entry.target);
            // 検知した変更の矩形
            //const rect = entry.contentRect;
            //console.log(rect.top, rect.left);
            //console.log(rect.width, rect.height);
            //変化したらプロットを一旦消す

            d3.select("svg").remove();
        }
    });
   const target = document.querySelector('.kukisen-container');
   resizeObserver.observe(target);

    //日時変更トリガ
    $('input[id="dtl"]').change(function() {
        let ymdhm=$(this).val();
        unixJP=(new Date(ymdhm)).getTime()/1000;
        //console.log(ymdhm,unixJP);
        plot_main();
    });

    change_checkbox();//チェックボックス　変化取得
    initial_sensor_set();//センサー設定の初期値
    sensor_color();//センサー系列


})

//////////////////////描画パラメータ//////////////////////
var unixJP;//現在表示中のunix
var ymdhm;//表示日時
var prm_span_min=15;//15分おきのプロット
var tori=true;//データをとりにいくトリガ（センサー選択が変わったか、時間が逸脱してるか）
var having_unixJP={from:0,to:1};//持ってるデータのunix
var sensor_set=[];//センサーチェック設定
var all_data={};
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


//////////////////////kukisen function//////////////////////
//チェックボックス　変化取得
function change_checkbox(){
    $('input[class="sensor_select"]').change(function() {
        //チェックボックス取得
        let are=$('.sensor_select:checked').map(function() {
            return $(this).val();
        }).get();
        localStorage.setItem("lorath_sensor_set",JSON.stringify(are));
        sensor_set=are;
        tori=true;
    });
}
//センサー設定の初期値
function initial_sensor_set(){
    let sset=JSON.parse(localStorage.getItem("lorath_sensor_set"));
    //console.log(sset);
    if(sset){
        $('input:checkbox[class="sensor_select"]').val(sset);
        sensor_set=sset;
    }
}
//センサーの色系列
function sensor_color(){
    let text=[];
    $('input[class="sensor_select"]:checked').each(function() {
        text.push( $(this).parent().text() );
    });
    let n=0;
    let txt="";
    text.forEach(function (arr) {
        txt+='<label>';
        txt+='<span style="color:'+backgroundColor[n]+';font-size:2em;"> ■</span>';
        txt+=arr;
        txt+='</label>';
        n++;
    });
    $('.flex2').html(txt);
}
//メインシーケンス
function plot_main(){

    sensor_color();//系列の作成

    let unix_yoyu=60*60*6;//〇時間分の余裕を切ったらデータ取得
    if((unixJP<(having_unixJP.from+unix_yoyu))||(unixJP>(having_unixJP.to-unix_yoyu))){
        tori=true;
    }
    //データをとりにいく
    if(tori){
        getdata();
    }
    //描画
    data_plot();
}
function getdata(){
    tori=false;
    $("#situation").text("データ取得中・・・");
    let unix_range=60*60*24*1;//前後〇日分のデータを取得する
    having_unixJP.from=unixJP-unix_range;
    having_unixJP.to=unixJP+unix_range;
    let timeJP0=unix2timeJP(having_unixJP.from);
    let timeJP1=unix2timeJP(having_unixJP.to);
    let prm={
        kdata:true,
        kikan:{
            from:timeJP0.year+"/"+timeJP0.month+"/"+timeJP0.day+" "+timeJP0.hour+":"+timeJP0.minute,
            to:timeJP1.year+"/"+timeJP1.month+"/"+timeJP1.day+" "+timeJP1.hour+":"+timeJP1.minute,
        },
        sensor:sensor_set,
    }
    let pass="lorath/get-sensor-data";
    ajax_post(pass,prm).done(function(result) {
        //console.log("ok",result);
        all_data=result;
        $("#situation").text("ok");
    }).fail(function(result) {
        console.log("ng",result);
    });
}
function data_plot(){
    //console.log("start airplot");
    d3.select("svg").remove();
    //空気線図座標定義（DOM要素）
    var b=$(".kukisen-container");
    //console.log(b.height() + '×' + b.width());
    var x_min =  b.width()*0.01;
    var x_max = b.width()*0.99;
    var y_min = b.height()*0.01;
    var y_max = b.height()*0.94;
    var width = x_max;//描画範囲
    var height =y_max;//描画範囲
    //svgの領域設定
    var svg = d3.select(".kukisen-container").append("svg").attr("width", width).attr("height", height);
    //console.log(svg);
    //軸スケールの設定
    var xScale = d3.scaleLinear()
    .domain([0, 100])
    .range([x_min*0.9, x_max*0.908]);
    var yScale = d3.scaleLinear()
    .domain([0, 100])
    .range([y_max*0.974, y_min*2.8]);

    let plot_size=4*b.width()/720;
    
    let snum=0;
    sensor_set.forEach(function (arr) {
        let d=all_data[arr];
        if(d){
            let tempdata=get_tempdata(d);
            //console.log(tempdata);
            if(tempdata.length>0){
                //console.log(JSON.stringify(tempdata));
                svg.append("g")
                .selectAll("circle")
                .data(tempdata)
                .enter()
                .append("circle")
                .attr("cx", function(d) {return xScale(d[0]);})
                .attr("cy", function(d) {return yScale(d[1]);})
                .attr("stroke", "black")
                .attr("stroke-width", "0.2px")
                .attr("fill", backgroundColor[snum])
                .attr("r", plot_size);
            }
        }
        snum++;
    });
    //手動時dataset
    /*
    sampledataset = [
        [0, 0],
        [0, 50],
        [0, 100],
        [50, 0],
        [50, 50],
        [50, 100],
        [100, 0],
        [100, 50],
        [100, 100]
    ];
    svg.append("g")
    .selectAll("circle")
    .data(sampledataset)
    .enter()
    .append("circle")
    .attr("cx", function(d) {return xScale(d[0]);})
    .attr("cy", function(d) {return yScale(d[1]);})
    .attr("stroke", "black")
    .attr("stroke-width", "0.2px")
    .attr("fill", "red")
    .attr("r", plot_size);
    */
}


function get_tempdata(d){
    let m=0;
    let n=0;
    let res=[];
    //console.log(d);
    d.unix_xxx.forEach(function (arr) {
        if(arr>=unixJP&&arr<unixJP+60*prm_span_min){
            //console.log(unixJP,arr,unixJP+60*prm_span_min);
            res[m]=d.data[n];
            m++;
        }
        n++;
    });
    //console.log(res);
    return res;
}

//////////////////////function//////////////////////
//初期値
function saishin(){
    //初期日時
    unixJP = (new Date()).getTime()/1000-3600*3;
    change_hyoji_nichiji(unixJP);
}
//表示日時変更
function change_hyoji_nichiji(unix){
    let w=unix2timeJP(unix);
    ymdhm=w.year+"-"+w.month+"-"+w.day+"T"+w.hour+":"+w.minute;
    $('input[id="dtl"]').val(ymdhm);//値の設定
}
function unix2timeJP(unix){
    let timeJP = new Date((unix)*1000);
    let res={
        "year":String(timeJP.getFullYear()),
        "month" : ("0"+(timeJP.getMonth()+1)).slice(-2),
        "day" : ("0"+timeJP.getDate()).slice(-2),
        "hour" : ("0"+timeJP.getHours()).slice(-2),
        "minute" : ("0"+timeJP.getMinutes()).slice(-2),
        "second" : ("0"+timeJP.getSeconds()).slice(-2)
    };
    return res
}
