var tem = '0';
var hum = '0';
var countdown_thing;

require.config({
    paths:{
        "jquery":"../bs3/js/jquery.min",
        "text":"text",
        "page1":"../index.html",
        "page2":"../index2.html",
        "page3":"../finish_classification2.html",
        "recycle":"../result_recycle.html",
        "harmful":"../result_harmful.html",
        "kitchen":"../result_kitchen.html",
        "other":"../result_other.html"
    }
});

require(['jquery','text!page1','text!page2','text!page3','text!recycle','text!harmful','text!kitchen','text!other'],function ($,page1,page2,page3,recycle,hramful,kitchen,other) {
    //加载首页
    $(".page").html(page2);
    // //返回按钮
    // $('.page').on('click','.back',function () {
    //     go(page1);
    // });

    // 页面跳转
    $('.page').on('click','.go-finish',function () {
        go(page3);
    });


    // 初始化一个 WebSocket 对象
    console.log('begin');
    var ws = new WebSocket('ws://localhost:8002');
    var ws2 = new WebSocket('ws://localhost:8012');
    // 接收服务端数据时触发事件
    ws.onmessage = function(evt) {
        var received_msg = evt.data;

        // if (received_msg=="finish"){
        //     go(page3);
        // }else if (received_msg=="back"){
        //     go(page2);
        // }

        var json = JSON.parse(received_msg);
        if (json.name == "TemAndHum"){
            console.log('tem:'+json.data.tem);
            console.log('hum:'+json.data.hum);
            tem = json.data.tem;
            hum = json.data.hum;
            $("#TemAndHum").html("温度："+json.data.tem+"°C"+" 湿度："+json.data.hum+"%")
        }else if(json.name == "finish"){
            console.log('UID:',json.uid);
            console.log("1:",json.data[0].type+"---"+json.data[0].accuracy);
            console.log("2:",json.data[1].type+"---"+json.data[1].accuracy);
            console.log("2:",json.data[2].type+"---"+json.data[2].accuracy);
            console.log("3:",json.data[3].type+"---"+json.data[3].accuracy);
            go(page3);
            $("#uid").html("你的UID号为"+json.uid);
            set_result("1",json.data[0].type,json.data[0].accuracy,recycle,hramful,kitchen,other);
            set_result("2",json.data[1].type,json.data[1].accuracy,recycle,hramful,kitchen,other);
            set_result("3",json.data[2].type,json.data[2].accuracy,recycle,hramful,kitchen,other);
            set_result("4",json.data[3].type,json.data[3].accuracy,recycle,hramful,kitchen,other);
            countdown_thing = window.setInterval(function () {countdown("#countdown1",page2);},1000)

        }else if (json.name == "back"){
            go(page2);
            if (tem != '0' || hum != '0'){
                $("#TemAndHum").html("温度："+tem+"°C"+" 湿度："+hum+"%");
            }
        }else if(json.name == "status"){
            var str = "";
            if (json.data.recycle == '1'){
                if (str == ""){
                    str = '可回收物';
                }else {
                    str = str+'、可回收物';
                }

            }
            if (json.data.harmful == '1'){
                if (str == ""){
                    str = '有害垃圾';
                }else {
                    str = str+'、有害垃圾';
                }
            }
            if (json.data.kitchen == '1'){
                if (str == ""){
                    str = '餐余垃圾';
                }else {
                    str = str+'、餐余垃圾';
                }
            }
            if (json.data.other == '1'){
                if (str == ""){
                    str = '其他垃圾';
                }else {
                    str = str+'、其他垃圾';
                }
            }
            console.log(str);
            $("#status").html(str == ""?str:str+' 已满');
        }
        console.log('数据已接收...' + received_msg);

    };




    // 接收服务端数据时触发事件
    ws2.onmessage = function(evt) {
        var received_msg = evt.data;

        // if (received_msg=="finish"){
        //     go(page3);
        // }else if (received_msg=="back"){
        //     go(page2);
        // }

        var json = JSON.parse(received_msg);
        if (json.name == "TemAndHum"){
            console.log('tem:'+json.data.tem);
            console.log('hum:'+json.data.hum);
            tem = json.data.tem;
            hum = json.data.hum;
            $("#TemAndHum").html("温度："+json.data.tem+"°C"+" 湿度："+json.data.hum+"%")
        }else if(json.name == "finish"){
            console.log('UID:',json.uid);
            console.log("1:",json.data[0].type+"---"+json.data[0].accuracy);
            console.log("2:",json.data[1].type+"---"+json.data[1].accuracy);
            console.log("2:",json.data[2].type+"---"+json.data[2].accuracy);
            console.log("3:",json.data[3].type+"---"+json.data[3].accuracy);
            go(page3);
            $("#uid").html("你的UID号为"+json.uid);
            set_result("1",json.data[0].type,json.data[0].accuracy,recycle,hramful,kitchen,other);
            set_result("2",json.data[1].type,json.data[1].accuracy,recycle,hramful,kitchen,other);
            set_result("3",json.data[2].type,json.data[2].accuracy,recycle,hramful,kitchen,other);
            set_result("4",json.data[3].type,json.data[3].accuracy,recycle,hramful,kitchen,other);
            countdown_thing = window.setInterval(function () {countdown("#countdown1",page2);},1000)

        }else if (json.name == "back"){
            go(page2);
            if (tem != '0' || hum != '0'){
                $("#TemAndHum").html("温度："+tem+"°C"+" 湿度："+hum+"%");
            }
        }else if(json.name == "status"){
            var str = "";
            if (json.data.recycle == '1'){
                if (str == ""){
                    str = '可回收物';
                }else {
                    str = str+'、可回收物';
                }

            }
            if (json.data.harmful == '1'){
                if (str == ""){
                    str = '有害垃圾';
                }else {
                    str = str+'、有害垃圾';
                }
            }
            if (json.data.kitchen == '1'){
                if (str == ""){
                    str = '餐余垃圾';
                }else {
                    str = str+'、餐余垃圾';
                }
            }
            if (json.data.other == '1'){
                if (str == ""){
                    str = '其他垃圾';
                }else {
                    str = str+'、其他垃圾';
                }
            }
            console.log(str);
            $("#status").html(str == ""?str:str+' 已满');
        }
        console.log('数据已接收...' + received_msg);

    };

    // $('.page').on('click','.time',function () {
    //     go(page3);
    // });


});



function go(page) {
    $(".page").html(page);
    $('body').scrollTop(0);
}


function set_result(id,result_type,accuracy,recycle,harmful,kitchen,other){
    console.log(id);
    switch (result_type) {
        case "recycle":
            $("#result"+id).html(recycle);
            $("#recycle_"+"acc").html("可回收垃圾"+accuracy+"%");
            // 处理进度条过程
            var process_recycle;
            if (parseInt(accuracy)<60){
                accuracy = (parseInt(accuracy)+10).toString();
            }
            process_recycle = window.setInterval(function(){process("process_recycle",accuracy,process_recycle);},10);
            break;
        case "harmful":
            $("#result"+id).html(harmful);
            $("#harmful_"+"acc").html("有害垃圾"+accuracy+"%");
            var process_harmful;
            // 这里的目的是，在低准确率下，进度条太短，文字会显示不出来，设置<60?+10  可以解决这种情况，并且不会出现低准确率的条比高准确率的条宽的情况
            if (parseInt(accuracy)<60){
                accuracy = (parseInt(accuracy)+10).toString();
            }
            process_harmful = window.setInterval(function(){process("process_harmful",accuracy,process_harmful);},10);
            break;
        case "kitchen":
            $("#result"+id).html(kitchen);
            $("#kitchen_"+"acc").html("餐余垃圾"+accuracy+"%");
            var process_kitchen;
            if (parseInt(accuracy)<60){
                accuracy = (parseInt(accuracy)+10).toString();
            }
            process_kitchen = window.setInterval(function(){process("process_kitchen",accuracy,process_kitchen);},10);
            break;
        case "other":
            $("#result"+id).html(other);
            $("#other_"+"acc").html("其他垃圾"+accuracy+"%");
            var process_other;
            if (parseInt(accuracy)<60){
                accuracy = (parseInt(accuracy)+10).toString();
            }
            process_other = window.setInterval(function(){process("process_other",accuracy,process_other);},10);
            break;
    }
}


function process(s,pro_width,thing) {
    var process = document.getElementById(s);
    process.style.width = parseInt(process.style.width) + 1 + "%";
    if(process.style.width == pro_width+"%"){
        window.clearInterval(thing);
    }
}


function countdown(s,page) {
    // jQuery实现方式
    $(s).html(parseInt($(s).html())-1);
    if ($(s).html() == "0"){
        window.clearInterval(countdown_thing);
        go(page);
        if (tem != '0' || hum != '0'){
            $("#TemAndHum").html("温度："+tem+"°C"+" 湿度："+hum+"%");
        }
    }
}
