

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
    url: ' http://strapi.nonstopplc.com:1440/Rooms?_where[status]=Available',
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
// populate roomnumber
function populate(){
  $.ajax({
    url: 'http://strapi.nonstopplc.com:1440/Rentals?_where[0][passed]=false',
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
function addMonths(date, months) {
  var d = date.getDate();
  date.setMonth(date.getMonth() + +months);
  if (date.getDate() != d) {
    date.setDate(0);
  }
  return date;
}

function gettotalprice() {
  console.log(document.getElementById("room").value)
 $.ajax({
   url: 'http://strapi.nonstopplc.com:1440/Rentals?_where[0][passed]=false&_where[1][room.roomnumber]='+document.getElementById("room").value,
   type: 'GET',
   contentType: 'application/json',
   headers:{
     'Authorization': 'Bearer '+readCookie("jwt")
   },
   success: function(result){
    
    const now = new Date();
    const ending = new Date(result[0].ends)
    var months;
    months = (ending.getFullYear() - now.getFullYear()) * 12;
    months -= now.getMonth();
    months += ending.getMonth();
    diffmonth = months <= 0 ? 0 : months;
    addedmonth = addMonths(now,diffmonth)
   // console.log(diffmonth)
    
    console.log(addedmonth)
    
  
    const dateFromAPI = ending;
    
    const datefromAPITimeStamp = (new Date(dateFromAPI)).getTime();
    const nowTimeStamp = addedmonth.getTime();
    const microSecondsDiff = Math.abs(datefromAPITimeStamp - nowTimeStamp);
    console.log(microSecondsDiff)
    // console.log(nowTimeStamp)
    // Math.round is used instead of Math.floor to account for certain DST cases
    // Number of milliseconds per day =
    //   24 hrs/day * 60 minutes/hour * 60 seconds/minute * 1000 ms/second
    const daysDiff = Math.round(microSecondsDiff / (1000 * 60 * 60  * 24));
    console.log(daysDiff)
     console.log(document.getElementById("month").value)
     
     document.getElementById("total").value=result[0].price*document.getElementById("month").value*1.15;
     if (document.getElementById("month").value == ''){document.getElementById("total").value=result[0].price*1.15;}
     document.getElementById("tenant").value=result[0].customer.name
     document.getElementById("lease").value=diffmonth +" Months "+daysDiff+" Days "
     document.getElementById("total").max = result[0].price
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
