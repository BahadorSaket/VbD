
function updateDropDownMenu(recomList)
{

  var dropDown = '<div class="dropdown dropdownMenu"> \
                    <button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">Dropdown Example \
                    <span class="caret"></span></button> \
                    <ul class="dropdown-menu">'+recomList+'</ul> \
                 </div>'
  $('<div/>', {
    class:"scatterAxis",
    html: "Assign "+ dropDown + " to the y Axis",
  }).appendTo('#suggestionPanel');

}

function addAxisRecom(tempList, addRecomFunc,removeRecomFunc)
{
  $( ".scatterAxis" ).remove();
  var recomList_x ="", recomList_y="";
  for(i=0;i<tempList.length;i++)
  {
     if(tempList[i].Type.split("_")[1]=="X")
        recomList_x += "<li><a href='#'>"+tempList[i].Type.split("_")[2]+"</a></li>";
     else
        recomList_y += "<li><a href='#'>"+tempList[i].Type.split("_")[2]+"</a></li>";
  }
  updateDropDownMenu(recomList_x);
  updateDropDownMenu(recomList_y);

  $('.scatterAxis').prepend('<a id="accept" style="float:right; padding-right:5px;" class="btnIcon" href="#"><i class="fa fa-search"></i></a></br>');
  $('.scatterAxis').prepend('<a id="reject" class="btnIcon" href="#"><i class="fa fa-times-circle"></i></a>');
  $('.scatterAxis').prepend('<a id="accept" class="btnIcon" href="#"><i class="fa fa-check-circle"></i></a>');
}




function removeDynRecom(recomID){
	//$('#recom_' + recomID).slideUp( "slow", function() { $('#recom_' + recomID).remove(); });
}
