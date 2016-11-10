
var dataPoint ="cars";
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

/*
  $( ".scatterAxis" ).remove();
  var recomList_x ="", recomList_y="";
  for(i=0;i<tempList.length;i++)
  {
     if(tempList[i].Type.split("-")[1]=="X")
        recomList_x += "<li><a href='#'>"+tempList[i].Type.split("-")[2]+"</a></li>";
     else
        recomList_y += "<li><a href='#'>"+tempList[i].Type.split("-")[2]+"</a></li>";
  }
  console.log(recomList_x);
  updateDropDownMenu(recomList_x);
  updateDropDownMenu(recomList_y);

  $('.scatterAxis').prepend('<a id="accept" style="float:right; padding-right:5px;" class="btnIcon" href="#"><i class="fa fa-search"></i></a></br>');
  $('.scatterAxis').prepend('<a id="reject" class="btnIcon" href="#"><i class="fa fa-times-circle"></i></a>');
  $('.scatterAxis').prepend('<a id="accept" class="btnIcon" href="#"><i class="fa fa-check-circle"></i></a>');
*/
}

function addSelectionRecom(tempList)
{
  console.log(tempList);
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
  $('<div/>', {
    class:"Selection recom",
    html: "Select "+ dataPoint + " with the same " + dropDown +"values",
  }).appendTo('#suggestionPanel');

  $('.Selection').prepend('<a id="accept" style="float:right; padding-right:5px;" class="btnIcon" href="#"><i class="fa fa-eye" aria-hidden="true"></i></a></br>');
  $('.Selection').prepend('<a id="reject" class="btnIcon" href="#"><i class="fa fa-times-circle"></i></a>');
  $('.Selection').prepend('<a id="accept" class="btnIcon" href="#"><i class="fa fa-check-circle"></i></a>');

}


function removeDynRecom(recomID){
	//$('#recom_' + recomID).slideUp( "slow", function() { $('#recom_' + recomID).remove(); });
}
