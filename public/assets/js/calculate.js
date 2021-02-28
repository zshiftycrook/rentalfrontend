

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

  console.log("paid")
  var lastpayed = null ;
  $.ajax({
    url: 'http://strapi.nonstopplc.com:1440/Payments?_where[rental.id]='+rid,
    type: 'GET',
    contentType: 'application/json',
    headers:{
      'Authorization': 'Bearer '+readCookie("jwt")
    },
    success:  async function(results){
      
      if(results.data == undefined){
        var j= await getRental(rid);
        
        //console.log(j)
        lastpayed = j.starting
        resolve (lastpayed);
        
    }
    else{ 
        for (var i=0;results.data[i]!= undefined; i++){
        if(lastpayed == null){
           lastpayed = results.data[i].ends
           
        }
        else if(lastpayed<results.data[i].ends){
            lastpayed = results.data[i].ends
            
        }
        
    }}
     
    //resolve (lastpayed);
    },
    error: function(error){
     resolve ("0");
    }
  })

  }) 
  
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
    const ending = new Date(result[0].ends)
    const lastpaid = new Date(await paiduntil(result[0].id))
    console.log(lastpaid)
    //Remaning Rental
    var months;
    months = (ending.getFullYear() - now.getFullYear()) * 12;
    months -= now.getMonth();
    months += ending.getMonth();
    diffmonth = months <= 0 ? months : months;
    addedmonth = addMonths(now,diffmonth)
    const dateFromAPI = ending;
    const datefromAPITimeStamp = (new Date(dateFromAPI)).getTime();
    const nowTimeStamp = addedmonth.getTime();
    const microSecondsDiff = Math.abs(datefromAPITimeStamp - nowTimeStamp);
    //console.log(microSecondsDiff)
    // console.log(nowTimeStamp)
    // Math.round is used instead of Math.floor to account for certain DST cases
    // Number of milliseconds per day =
    //   24 hrs/day * 60 minutes/hour * 60 seconds/minute * 1000 ms/second
    const daysDiff = Math.round(microSecondsDiff / (1000 * 60 * 60  * 24));
    //console.log(daysDiff)
    // console.log(document.getElementById("month").value)
    //////////////////////////////////////////////////////////////////////////////////////////
    //Remaining Payment
    var pmonths;
    pmonths = (lastpaid.getFullYear() - now.getFullYear()) * 12;
    pmonths -= now.getMonth();
    pmonths += lastpaid.getMonth();
    pdiffmonth = pmonths <= 0 ? 0 : pmonths;
    //if (pmonths>0){
      paddedmonth = addMonths(now,pdiffmonth)
      const pdateFromAPI = lastpaid;
      const pdatefromAPITimeStamp = (new Date(pdateFromAPI)).getTime();
      const pnowTimeStamp = paddedmonth.getTime();
      const pmicroSecondsDiff = Math.abs(pdatefromAPITimeStamp - pnowTimeStamp);
      var pdaysDiff = Math.round(pmicroSecondsDiff / (1000 * 60 * 60  * 24));
  //  }
    // else{
    //   addedmonth = addMonths(now,diffmonth)
    //   const dateFromAPI = ending;
    //   const datefromAPITimeStamp = (new Date(dateFromAPI)).getTime();
    //   const nowTimeStamp = addedmonth.getTime();
    //   const microSecondsDiff = Math.abs(datefromAPITimeStamp - nowTimeStamp);

    // }

    
     
     document.getElementById("total").value=result[0].price*document.getElementById("month").value*1.15;
     if (document.getElementById("month").value == ''){document.getElementById("total").value=result[0].price*1.15;}
     document.getElementById("tenant").value=result[0].customer.name
     document.getElementById("paid").value=pmonths+" Months "+pdaysDiff+" Days" 
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
