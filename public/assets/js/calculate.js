
function gettotalprice() {
  // Declare variables
    request.open("GET", "http://localhost:1337/Rentals")
    request.send();
    request.onload =()=>{
        console.log(request);
        if(request.status == 200){
            console.log(JSON.parse(request.response));

        }
    }
  // Loop through all table rows, and hide those who don't match the search query
    request.open
}
