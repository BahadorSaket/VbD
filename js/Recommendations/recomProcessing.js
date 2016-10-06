var recomProcessing = function(xAxisScoringVector,yAxisScoringVector){
    this.xAxisScoringVector = xAxisScoringVector;
    this.yAxisScoringVector = yAxisScoringVector;
    this.recommendations = [{"Type":"initial", "Weight":0.0}]; // recommendation is a list of objects where each object contains information about one recommendation
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
     var Type = "Axis_X_"+ Obj.xAxisScoringVector[i].key;
     tempRecommendations.push({"ID":i, "Type":Type, "Weight":0.0, "Relavance":Obj.xAxisScoringVector[i].val});
     Type = "Axis_Y_"+ Obj.xAxisScoringVector[i].key;
     tempRecommendations.push({"ID":i+1, "Type":Type, "Weight":0.0, "Relavance":Obj.yAxisScoringVector[i].val});
   }

   this.recommendations = this.checkAvailabilityOfRecommendations(tempRecommendations);

   var recomPres = new recomPresentation();
   recomPres.scatterRecomType(this.recommendations); // send recom for presentation
}
