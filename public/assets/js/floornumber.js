

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
  function getroomnumber(result){
      
  }
function generatefloor(){
    
  
        $.ajax({
            url: 'http://strapi.nonstopplc.com:1440/Floor-numbers',
            type: 'GET',
            contentType: 'application/json',
            headers:{
              'Authorization': 'Bearer '+readCookie("jwt")
            },
            success: async function(result){
              
              console.log(result[0].floor)
              for (var i=0;i<Object.keys(result).length;i++){
                var select = document.getElementById("floor");
                console.log(result[i].floor)
                select.options[select.options.length] = new Option(result[i].floor, result[i].floor);

              }
             
              
            },
            error: function(error){
             
            }
          }) 
    
}