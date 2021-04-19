function myFunction() {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("search");
    filter = input.value.toUpperCase();
    table = document.getElementById("dataTable");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[document.getElementById("catagory").value];
      if (td) {
        txtValue = td.textContent || td.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }       
    }
  }
  function GetFormattedDate() {
    var todayTime = Document.get
    var month = format(todayTime .getMonth() + 1);
    var day = format(todayTime .getDate());
    var year = format(todayTime .getFullYear());
    console.log()
    return month + "/" + day + "/" + year;

}
function showTableData() { 
  document.getElementById('info').innerHTML = ""; 
  var myTab = document.getElementById('empTable'); 
  var opt = document.getElementById("opt").value; 
  var index = document.getElementById(opt).cellIndex; 
  
  for (i = 1; i < myTab.rows.length; i++) { 
      var objCells = myTab.rows.item(i).cells; 
      
      for (var j = index; j <= index; j++) { 
          info.innerHTML = info.innerHTML + ' ' + objCells.item(j).innerHTML; 
      } 
      
      info.innerHTML = info.innerHTML + '<br />'; 
  } 
}