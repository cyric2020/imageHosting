var url = `${window.location.protocol}//${window.location.hostname}${(window.location.port ? ':' + window.location.port: '')}`;

function login(){
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;

  if(username == '' || username == undefined || password == '' || password == undefined){
    alert('Username or password empty.');
    return;
  }

  $.post(url + '/token', {username: username, password: password}, function(data){
    if(data.Token != undefined){
      localStorage.setItem('Token', data.Token);
      window.location.href = url + '/dashboard';
    }else{
      alert('Username or password invalad.');
      return;
    }
  });
}

window.onload = function(){
  if(localStorage.getItem('Token') == undefined || localStorage.getItem('Token') == null){
    localStorage.setItem('Token', '');
  }
}
