
var dataPoint ="cars";

$( "div.dropdown").children("button").click(function(){
  console.log("I MA HEREWERWJR");
});


function updateDropDownMenu(recomList)
{

  var dropDown = '<div class="dropdown dropdownMenu"> \
                    <button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">Dropdown Example \
                    <span class="caret"></span></button> \
                    <ul class="dropdown-menu">'+recomList+'</ul> \
                 </div>'
  return dropDown;
}

function addAxisRecom(tempList)
{
}

function addSelectionRecom(tempList)
{
  $( ".Selection" ).remove();
  var sameAttrList ="", rangeAttrList="";
  for(i=1;i<tempList.length;i++)
  {
     if(tempList[i].Type.split("-")[2]==tempList[i].Type.split("-")[3] )
        sameAttrList += "<li><a href='#'>"+tempList[i].Type.split("-")[1]+"</a></li>";
     else
     {
       $('<div/>', {
         class:"Selection recom",
         html: "Select "+ dataPoint + " with " + tempList[i].Type.split("-")[1]+" between " + tempList[i].Type.split("-")[2] + " and " + tempList[i].Type.split("-")[3],
       }).appendTo('#suggestionPanel');
     }
  }

  var dropDown=updateDropDownMenu(sameAttrList);
  if(sameAttrList.length!=0)
  {
    $('<div/>', {
      class:"Selection recom",
      html: "Select "+ dataPoint + " with the same " + dropDown +"values",
    }).appendTo('#suggestionPanel');
  }
  

  $('.Selection').prepend('<a id="accept" style="float:right; padding-right:5px;" class="btnIcon" href="#"><i class="fa fa-eye" aria-hidden="true"></i></a></br>');
  $('.Selection').prepend('<a id="reject" class="btnIcon" href="#"><i class="fa fa-times-circle"></i></a>');
  $('.Selection').prepend('<a id="accept" class="btnIcon" href="#"><i class="fa fa-check-circle"></i></a>');
}
