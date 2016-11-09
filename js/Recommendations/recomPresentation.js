var recomPresentation = function(){
}

recomPresentation.prototype.scatterAxesRecom= function(recommendations){
  var tempList=[];
  for(i=0;i<recommendations.length;i++)
  {
    tempList.push(recommendations[i]);
  }
  addAxisRecom(tempList, function() {

  },
  function(){

  });
}

recomPresentation.prototype.scatterSelectionRecom= function(recommendations){
  addSelectionRecom(recommendations)
}

function removeDynRecom(recomID){
	//$('#recom_' + recomID).slideUp( "slow", function() { $('#recom_' + recomID).remove(); });
}
