var url = `${window.location.protocol}//${window.location.hostname}${(window.location.port ? ':' + window.location.port: '')}`;

window.onload = function(){
  var token = localStorage.getItem('Token');
  $.post(url + '/verify', {token: token}, function(data){
    if(data.Valid == false){
      window.location.href = url + '/login';
    }
    loadImages();
  });
}

function loadImages(){
  $.get(url + '/imagelist', {token: localStorage.getItem('Token')}, function(data){
    for(i = 0; i < data.length; i++){
      var div = document.createElement('div');
      div.classList.add('item');
      div.classList.add('flex');

      var image = document.createElement('img');
      image.classList.add('flex-item');
      image.src = url + '/' + data[i].id;

      var name = document.createElement('span');
      name.classList.add('flex-item');
      name.innerHTML = '<b>Name: </b>' + data[i].id;

      var size = document.createElement('span');
      size.classList.add('flex-item');
      size.innerHTML = '<b>Size: </b>' + data[i].size;

      var dimensions = document.createElement('span');
      dimensions.classList.add('flex-item');
      dimensions.innerHTML = '<b>Dimensions: </b>' + `${data[i].dimensions.width}x${data[i].dimensions.height}`;

      var table = document.getElementById('table');
      table.appendChild(div);

      div.appendChild(image);
      div.appendChild(name);
      div.appendChild(size);
      div.appendChild(dimensions);
    }
  });
}
