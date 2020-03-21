/**
 * 画面読み込み時の処理
 */

$(document).ready(function() {
  localStorage.clear();
  sessionStorage.clear();
});


function signin() {
  var user = $("#user").val();
  var password = $("#password").val();

  if (!user | !password) {
    $("#message span").text("All fields are required.");
    return false;
  }

  let body_autho = {
    user: user,
    pass: password
  };
  //console.log(body_autho);
  let pass_autho = "../autho";
  $("#message span").text("認証確認中");
  ajax_post(pass_autho, body_autho)
    .done(function(result) {
      //console.log("ok", result);
      if (result.autho) {
        $("#message span").text("認証OK");
        localStorage.setItem("autho", JSON.stringify(body_autho));
        sessionStorage.setItem("menumap", JSON.stringify(result.menumap));
        sessionStorage.setItem("mmms_bukken", JSON.stringify(result.mmms_bukken));
        $(location).attr("href", "./");//現在
      } else {
        $("#message span").text("認証NG");
      }
    })
    .fail(function(result) {
      console.log(result);
      $("#message span").text("net fail, 認証NG");
    });
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
