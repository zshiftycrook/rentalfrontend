function func(){
  //  console.log(document.getElementById("formCheck-4").checked)
    if(document.getElementById("formCheck-4").checked){
        document.getElementById("submit").disabled = false;
    }
    else
    {
        document.getElementById("submit").disabled = true;
    }
}