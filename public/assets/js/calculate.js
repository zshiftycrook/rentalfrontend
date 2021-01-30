

function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}
function populateRental(){
  $.ajax({
    url: 'http://strapi.nonstopplc.com:1440/Customers',
    type: 'GET',
    contentType: 'application/json',
    headers:{
      'Authorization': 'Bearer '+readCookie("jwt")
    },
    success: function(result){
      var option = '';
      //console.log(result[0].roomnumber)
      for (var i=0;i<Object.keys(result).length;i++){
        option += '<option value="' +result[i].name + '"/>';
      }
      console.log(option)
      document.getElementById('customer').innerHTML = option;
    },
    error: function(error){
     
    }
  }) 
  $.ajax({
    url: 'http://strapi.nonstopplc.com:1440/Rooms',
    type: 'GET',
    contentType: 'application/json',
    headers:{
      'Authorization': 'Bearer '+readCookie("jwt")
    },
    success: function(result){
      var option = '';
      //console.log(result[0].roomnumber)
      for (var i=0;i<Object.keys(result).length;i++){
        option += '<option value="' +result[i].roomnumber + '"/>';
      }
      console.log(option)
      document.getElementById('roomnumber').innerHTML = option;
    },
    error: function(error){
     
    }
  }) 
 
     
 
     
}

function populate(){
  $.ajax({
    url: 'http://strapi.nonstopplc.com:1440/Rentals',
    type: 'GET',
    contentType: 'application/json',
    headers:{
      'Authorization': 'Bearer '+readCookie("jwt")
    },
    success: function(result){
      var option = '';
      //console.log(result[0].roomnumber)
      for (var i=0;i<Object.keys(result).length;i++){
        option += '<option value="' +result[i].room.roomnumber + '"/>';
      }
      console.log(option)
      document.getElementById('roomnumber').innerHTML = option;
    },
    error: function(error){
     
    }
  }) 
 
     console.log(readCookie("jwt"))
}

function gettotalprice() {
  console.log(document.getElementById("room").value)
 $.ajax({
   url: 'http://strapi.nonstopplc.com:1440/Rentals?_where[room.roomnumber]='+document.getElementById("room").value,
   type: 'GET',
   contentType: 'application/json',
   headers:{
     'Authorization': 'Bearer '+readCookie("jwt")
   },
   success: function(result){
    console.log(result[0])
    const dateFromAPI = result[0].ends;
    const now = new Date();
    const datefromAPITimeStamp = (new Date(dateFromAPI)).getTime();
    const nowTimeStamp = now.getTime();
    const microSecondsDiff = Math.abs(datefromAPITimeStamp - nowTimeStamp);
    
    // Math.round is used instead of Math.floor to account for certain DST cases
    // Number of milliseconds per day =
    //   24 hrs/day * 60 minutes/hour * 60 seconds/minute * 1000 ms/second
    const daysDiff = Math.round(microSecondsDiff / (1000 * 60 * 60  * 24));
     console.log(result[0].price)
     console.log(document.getElementById("month").value)
     
     document.getElementById("total").value=result[0].price*document.getElementById("month").value*1.15;
     if (document.getElementById("month").value == ''){document.getElementById("total").value=result[0].price*1.15;}
     document.getElementById("tenant").value=result[0].customer.name
     document.getElementById("lease").value=daysDiff
   },
   error: function(error){
    document.getElementById("total").value=0
     document.getElementById("tenant").value=NONE
     document.getElementById("lease").value=0
   }
 }) 

    console.log(readCookie("jwt"))
}

var close = document.getElementsByClassName("closebtn");
var i;
for (i = 0; i < close.length; i++) {
  close[i].onclick = function(){
    var div = this.parentElement;
    div.style.opacity = "0";
    setTimeout(function(){ div.style.display = "none"; }, 600);
  }
}
// options
