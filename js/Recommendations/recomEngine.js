
var recomEngine = function(type, oldData, newData){
    this.oldData= oldData;
    this.newData= newData;
    this.type = type;
}


recomEngine.prototype.scatterGetRecom= function(Obj){
    if(Obj.type == "drag")
    {
      var xAxisScoringVector = scatterAxesRecomCalculation("xAxis", Obj.oldData, Obj.newData);
      var yAxisScoringVector = scatterAxesRecomCalculation("yAxis", Obj.oldData, Obj.newData);
      var recomProcess = new recomProcessing(xAxisScoringVector,yAxisScoringVector);
      recomProcess.scatterAssignAttrToAxes(recomProcess);
    }
    //List = Run some Analysis
    //have a list of recommendations= call specific recommendation()
}
