var url = `${window.location.protocol}//${window.location.hostname}${(window.location.port ? ':' + window.location.port: '')}`;

window.onload = function(){
  var token = localStorage.getItem('Token');
  $.post(url + '/verify', {token: token}, function(data){
    if(data.Valid == false){
      window.location.href = url + '/login';
    }
    // loadImages();
  });
}

function wait_async(milisec) {
    return new Promise(resolve => {
        setTimeout(() => { resolve('') }, milisec);
    })
}


const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

const socket = new WebSocket('ws://127.0.0.1:3001');

async function upload(){
  var loadingBar = document.getElementsByClassName('loading_bar')[0];
  loadingBar.style.display = 'block';
  var file = document.getElementById('file_selector').files[0];
  var base64 = await toBase64(file) + 'complete';

  var trimmed = base64.match(/.{1,7900}/g);

  loadingBar.value = 0;
  loadingBar.min = 0;
  loadingBar.max = trimmed.length;

  for(i = 0; i < trimmed.length; i++){
    await wait_async(1);
    loadingBar.value = i;
    await socket.send(trimmed[i]);
  }
}

socket.addEventListener('open', function (event) {
    socket.send('Hello Server!');
});
