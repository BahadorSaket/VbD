var recomPresentation = function(){
}

recomPresentation.prototype.scatterRecomType= function(recommendations){
  console.log(recommendations);
  var tempList=[];
  for(i=0;i<recommendations.length;i++)
  {
    Type = recommendations[i].Type.split("_")[0];
    if(Type == "Axis")
    {
      tempList.push(recommendations[i]);
    }
  }
  addAxisRecom(tempList, function() {

  },
  function(){

  });
}

  /*
	d3.select("svg").append("svg:foreignObject")
			.attr("id",'recom_'+ recomID)
			.attr("class", recomCoord.type)
			.attr("width", recomCoord.width)
			.attr("height",recomCoord.height)
			.attr("y", recomCoord.y)
			.attr("x", recomCoord.x)
		    .append("xhtml:span")
			.attr("class", "recommendation")
			.text(" "+recomText);

	$('#recom_' + recomID).fadeIn("slow");

	// Reject button
	$('#recom_' + recomID).prepend('<a id="reject" class="btn" href="#"><i class="fa fa-times-circle"></i></a>');
	$('#recom_' + recomID).find("#reject").click(function() {
		removeDynRecom(recomID); // remove the recom container
		removeRecomFunc();
	});
	// Accept button
	$('#recom_' + recomID).prepend('<a id="accept" class="btn" href="#"><i class="fa fa-check-circle">&nbsp;</i></a>');
	$('#recom_' + recomID).find("#accept").click(function() {
		removeDynRecom(recomID); // remove the recom container
		addRecomFunc(); // run the function that is passed as parameter
	});
  */

function removeDynRecom(recomID){
	//$('#recom_' + recomID).slideUp( "slow", function() { $('#recom_' + recomID).remove(); });
}
