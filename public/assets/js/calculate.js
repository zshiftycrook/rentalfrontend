

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
  const date1= new Date(date);
  date1.setMonth(date1.getMonth() + +months);
  if (date1.getDate() != d) {
    date1.setDate(0);
  }
  return date1;
}
function subtractMonths(date,months)
{
  var d = date.getDate();
  date.setMonth(date.getMonth() - months);
  console.log(date)
  if (date.getDate() != d) {
    date.setDate(0);
  }
  return date;
}

function getRental(id){
  return new Promise((resolve,reject)=>{
    $.ajax({
      url: 'http://strapi.nonstopplc.com:1440/Rentals/'+id,
      type: 'GET',
      contentType: 'application/json',
      headers:{
        'Authorization': 'Bearer '+readCookie("jwt")
      },
      success: function(result){
        console.log(result);
        resolve (result);
      },
      error: function(error){
       resolve (0);
      }
    }) 
  })

}

function paiduntil(rid){
  return new Promise((resolve,reject)=>{

  var lastpayed = null ;
  $.ajax({
    url: 'http://strapi.nonstopplc.com:1440/Payments?_where[rental.id]='+rid,
    type: 'GET',
    contentType: 'application/json',
    headers:{
      'Authorization': 'Bearer '+readCookie("jwt")
    },
    success:  async function(results){
      
      if(results[0] == undefined){
        var j= await getRental(rid);
        
     
        lastpayed = j.starting
        resolve (lastpayed);
        
    }
    else{ 
        for (var i=0;results[i]!= undefined; i++){
        if(lastpayed == null){
           lastpayed = results[i].ends
           
        }
        else if(lastpayed<results[i].ends){
            lastpayed = results[i].ends
            
        }
        
    }

  console.log(rid)
  console.log(lastpayed)
    resolve(lastpayed)
  }
     
    //resolve (lastpayed);
    },
    error: function(error){
     resolve ("0");
    }
  })

  }) 
  
}
function getMonth(ending,now){
 
  //console.log(now)
  //Remaning Rental
  var months;
  months = (ending.getFullYear() - now.getFullYear()) * 12;
  months -= now.getMonth();
  months += ending.getMonth();
  diffmonth = months <= 0 ? months : months;
  
  return (diffmonth);

}
function getMonth2(ending,now){
 
  //console.log(now)
  //Remaning Rental
  var months;
  months = (ending.getFullYear() - now.getFullYear()) * 12;
  months -= now.getMonth();
  months += ending.getMonth();
  diffmonth = months ;
  
  return (diffmonth);

}
function getDays(addedmonth,ending){
  const dateFromAPI = ending;
  const datefromAPITimeStamp = (new Date(dateFromAPI)).getTime();
  const nowTimeStamp = addedmonth.getTime();
  const microSecondsDiff = Math.abs(datefromAPITimeStamp - nowTimeStamp);
  console.log(microSecondsDiff)
  const daysDiff = Math.round(microSecondsDiff / (1000 * 60 * 60  * 24));
  return daysDiff
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
   success:  async function(result){
    const now = new Date();

    const lastpaid = new Date(await paiduntil(result[0].id))
    const ending = new Date(result[0].ends)
    console.log(lastpaid)
    var diffmonth=getMonth(ending,now)
    var addedmonth = addMonths(now,diffmonth)
    var daysDiff=getDays(addedmonth,ending)

    var pdiffmonth=getMonth2(lastpaid,now)
    console.log(pdiffmonth)
    //var p2diffmonth=getMonth(now,lastpaid)
    if (pdiffmonth<0)
    {
      pdiffmonth=(await getMonth(lastpaid,now))*(-1)
      
      
     
      var paddedmonth = addMonths(lastpaid,pdiffmonth)
      var pdaysDiff=getDays(paddedmonth,now)
      document.getElementById("paid").value="The Client is ovedue "+pdiffmonth+" months and "+pdaysDiff+" Days"; 
      document.getElementById("month").max=(diffmonth+pdiffmonth)
      console.log(pdaysDiff)
    }
    else
    {
      var paddedmonth = addMonths(now,pdiffmonth)
      //paddedmonth - pdiffmonth
      //var currentMonth = currentDate.getMonth()+1;
      var pdaysDiff =getDays(lastpaid,paddedmonth)
      document.getElementById("paid").value=pdiffmonth+" Months "+pdaysDiff+" Days" 
      document.getElementById("month").max=(diffmonth-pdiffmonth)
      console.log(paddedmonth)
    }

    
     document.getElementById("month").min=0;
     document.getElementById("total").value=document.getElementById("month").value*1.15*((result[0].price)+(result[0].parking*500));
     if (document.getElementById("month").value == ''){document.getElementById("total").value=result[0].price*1.15+(result[0].parking*500);}
     document.getElementById("tenant").value=result[0].customer.name
     document.getElementById("")
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
