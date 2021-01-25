

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


function gettotalprice() {
 $.ajax({
   url: 'http://strapi.nonstopplc.com:1440/Rentals?_where[room.roomnumber]='+document.getElementById("room").value,
   type: 'GET',
   contentType: 'application/json',
   headers:{
     'Authorization': 'Bearer '+readCookie("jwt")
   },
   success: function(result){
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
     document.getElementById("tenant").value=result[0].customer.name
     document.getElementById("lease").value=daysDiff
   },
   error: function(error){

   }
 }) 

    console.log(readCookie("jwt"))
}
