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
      image.style.flex = '0 0 auto';

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

      var linkSpan = document.createElement('span');
      linkSpan.classList.add('flex-item');
      linkSpan.innerHTML = `<b>Url:</b> <a href="${url}/${data[i].id}" target="_blank">${url}/${data[i].id}</a>`;

      var button = document.createElement('button');
      button.innerHTML = 'delete';
      button.classList.add('delete-button');

      var table = document.getElementById('table');
      table.appendChild(div);

      var datadiv = document.createElement('div');
      datadiv.classList.add('data');

      var row1 = document.createElement('div');
      row1.classList.add('row');
      row1.appendChild(name);
      row1.appendChild(size);
      row1.appendChild(dimensions);
      datadiv.appendChild(row1);

      var row2 = document.createElement('div');
      row2.classList.add('row');
      row2.appendChild(linkSpan);
      datadiv.appendChild(row2);


      div.appendChild(image);
      div.appendChild(datadiv);
      div.appendChild(button);
    }
  });
}
