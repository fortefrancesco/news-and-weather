function setLight () {
  document.getElementById('card').style.backgroundColor = "rgba(255, 255, 255, 0.8)"
  document.getElementById('card').style.color = "black"
  document.getElementById('search-bar').style.backgroundColor = "rgba(14, 14, 14, 0.8)"
  document.getElementById('search').style.backgroundColor = "rgba(14, 14, 14, 0.8)"
  //----
  document.getElementById('card1').style.backgroundColor = "rgba(255, 255, 255, 0.8)"
  document.getElementById('card1').style.color = "black"
}

function setDark () {
  document.getElementById('card').style.backgroundColor = "#000000d0"
  document.getElementById('card').style.color = "white"
  document.getElementById('search-bar').style.backgroundColor = "rgba(14, 14, 14, 0.8)"
  document.getElementById('search').style.backgroundColor = "rgba(14, 14, 14, 0.8)"
  //----
  document.getElementById('card1').style.backgroundColor = "#000000d0"
  document.getElementById('card1').style.color = "white"
}

document.addEventListener('DOMContentLoaded', function (){
    var checkbox = document.getElementById('switch');

    checkbox.addEventListener('change', function () {
        if(checkbox.checked) {
          setLight()
        } else {
          setDark()
        }
    });
});
