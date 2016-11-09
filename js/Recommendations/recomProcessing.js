var recomProcessing = function(xAxisScoringVector,yAxisScoringVector,GeneralizableSelectionOptions){
    this.xAxisScoringVector = xAxisScoringVector;
    this.yAxisScoringVector = yAxisScoringVector;
    this.recommendations = [{"Type":"initial", "Weight":0.0}]; // recommendation is a list of objects where each object contains information about one recommendation
    this.GeneralizableSelectionOptions = GeneralizableSelectionOptions;
}

function sortAxisVector(a,b){
   if (a.val < b.val)
     return -1;
   if (a.val > b.val)
     return 1;
   return 0;
}

recomProcessing.prototype.checkAvailabilityOfRecommendations=function(tempRecommendations){
   console.log(this.recommendations[0].Type, this.recommendations.length)
   var InitialLength= this.recommendations.length;
   for(i=0;i<tempRecommendations.length;i++)
   {
     var checker=false;
     for(j=0;j<InitialLength;j++)
     {
       if(tempRecommendations[i].Type==this.recommendations[j].Type)
       {
         checker=true;
       }
     }
     if(!checker)
     {
       this.recommendations.push(tempRecommendations[i]);
     }
   }
   return this.recommendations;
}

recomProcessing.prototype.scatterAssignAttrToAxes=function(Obj){
   Obj.xAxisScoringVector = Obj.xAxisScoringVector.sort(sortAxisVector);
   Obj.yAxisScoringVector = Obj.yAxisScoringVector.sort(sortAxisVector);

   var tempRecommendations = [];
   for(i=0;i<Obj.xAxisScoringVector.length;i++)
   {
     var Type = "Axis-X-"+ Obj.xAxisScoringVector[i].key;
     tempRecommendations.push({"ID": "Axis", "Type":Type, "Weight":0.0, "Relavance":Obj.xAxisScoringVector[i].val});
     Type = "Axis-Y-"+ Obj.xAxisScoringVector[i].key;
     tempRecommendations.push({"ID": "Axis", "Type":Type, "Weight":0.0, "Relavance":Obj.yAxisScoringVector[i].val});
   }

   this.recommendations = this.checkAvailabilityOfRecommendations(tempRecommendations);
   var recomPres = new recomPresentation();
   recomPres.scatterAxesRecom(this.recommendations); // send recom for presentation
}

recomProcessing.prototype.scatterGneralizableSelection=function(GeneralizableSelectionOptions){

   var tempRecommendations = [];
   for(i=0;i<GeneralizableSelectionOptions.length;i++)
   {
     var Type = "Select-"+ GeneralizableSelectionOptions[i].Attr+"-"+GeneralizableSelectionOptions[i].Min+"-"+GeneralizableSelectionOptions[i].Max;
     tempRecommendations.push({"ID": "Selection", "Type":Type, "Weight":0.0, "Relavance":GeneralizableSelectionOptions[i].Dis});
   }

   this.recommendations = this.checkAvailabilityOfRecommendations(tempRecommendations);
   var recomPres = new recomPresentation();
   recomPres.scatterSelectionRecom(this.recommendations); // send recom for presentation
   //console.log(this.recommendations);

}
