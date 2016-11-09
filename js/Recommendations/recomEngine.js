
var recomEngine = function(type, oldData, newData, listSelectedItems){
    this.oldData= oldData;
    this.newData= newData;
    this.type = type;
    this.listSelectedItems = listSelectedItems;

}


recomEngine.prototype.scatterGetRecom= function(Obj){
    if(Obj.type == "drag")
    {
      var xAxisScoringVector = scatterAxesRecomCalculation("xAxis", Obj.oldData, Obj.newData);
      var yAxisScoringVector = scatterAxesRecomCalculation("yAxis", Obj.oldData, Obj.newData);
      var recomProcess = new recomProcessing(xAxisScoringVector,yAxisScoringVector);
      recomProcess.scatterAssignAttrToAxes(recomProcess);
    }
    else if(Obj.type=="select")
    {
      var listOfAttributes = scatterSelectedItemsAttrCalculation(Obj.listSelectedItems);
      var recomProcess = new recomProcessing("","", recomProcess);
      recomProcess.scatterGneralizableSelection(listOfAttributes);
    }


    //List = Run some Analysis
    //have a list of recommendations= call specific recommendation()
}
