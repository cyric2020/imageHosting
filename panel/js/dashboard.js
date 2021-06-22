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
      if(data[i].size/1000 < 1000){
        size.innerHTML = '<b>Size: </b>' + Math.round(data[i].size/1000) + 'kb';
      }else{
        size.innerHTML = '<b>Size: </b>' + ((data[i].size/1000)/1000).toFixed(1) + 'mb';
      }

      var dimensions = document.createElement('span');
      dimensions.classList.add('flex-item');
      dimensions.innerHTML = '<b>Dimensions: </b>' + `${data[i].dimensions.width}x${data[i].dimensions.height}`;

      var button = document.createElement('button');
      button.innerHTML = 'delete';
      button.classList.add('delete-button');

      var table = document.getElementById('table');
      table.appendChild(div);

      div.appendChild(image);
      div.appendChild(name);
      div.appendChild(size);
      div.appendChild(dimensions);
      div.appendChild(button);
    }
  });
}
