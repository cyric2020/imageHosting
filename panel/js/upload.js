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

const socket = new WebSocket('ws://192.168.0.14:3001');

async function upload(){
  var loadingBar = document.getElementsByClassName('loading_bar')[0];
  var loadingText = document.getElementById('upload-progress');
  document.getElementById('file-container').style.display = 'block';
  var file = document.getElementById('file_selector').files[0];
  var base64 = await toBase64(file);

  var id;

  await $.post(url + '/init_upload', function(data){
    id = data.id;
  });

  var trimmed = base64.match(/.{1,7900}/g);

  loadingBar.value = 0;
  loadingBar.min = 0;
  loadingBar.max = trimmed.length;
  loadingText.innerHTML = '0%';

  for(i = 0; i < trimmed.length; i++){
    await wait_async(1);
    loadingBar.value = i;
    loadingText.innerHTML = `${(i/trimmed.length*100).toFixed(2)}%`;
    document.title = `Upload | ${(i/trimmed.length*100).toFixed(2)}%`;
    await socket.send(JSON.stringify({id: id, message: trimmed[i]}));
  }

  loadingBar.value = trimmed.length;
  loadingText.innerHTML = `100%`;
  document.title = `Upload`;

  await $.post(url + '/finish_upload', {id: id}, function(data){
    if(data.complete == true){
      alert('image complete');
    }
  });
}

socket.addEventListener('open', function (event) {
    socket.send('Hello Server!');
});
