
//Open and close sidebar
function openNav() {
  
  if(document.getElementById("mySidebar2").style.width == "0px" ){
    document.getElementById("mySidebar2").style.width = "250px";
	document.getElementById("main").style.marginLeft = "250px";
  }
  else if(document.getElementById("mySidebar2").style.width == ""){
    document.getElementById("mySidebar2").style.width = "250px";
	document.getElementById("main").style.marginLeft = "250px";
  }
  else{
    document.getElementById("mySidebar2").style.width = "0px";
	document.getElementById("main").style.marginLeft = "0";
  }
 }
//Close the sidebar
 function closeNav() {
  document.getElementById("mySidebar2").style.width = "0";
  document.getElementById("main").style.marginLeft = "0";
 }
 
//sticky navbar
window.onscroll = function() {stickyNav()};

var navbar = document.getElementById("navbar");
var sticky = navbar.offsetTop;

function stickyNav() {
  if (window.pageYOffset >= sticky) {
    navbar.classList.add("sticky")
  } else {
    navbar.classList.remove("sticky");
  }
}
//Copy email addresses to clipboard
function copyToClipboard(element) {
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val($(element).text()).select();
  document.execCommand("copy");
  $temp.remove();
  alert("Copied email address to clipboard");
}
 


      