
var Scatter_DragCircle = d3.behavior.drag()
      .origin(function(d) { return d; })
      .on("dragstart", dragstarted)
      .on("drag", dragged)
      .on("dragend", dragended);


function dragstarted(d,i) {
       oldDataset = clone(dataset);
       d3.select("#resizeIcon_"+i).attr("display", "none");
}

function dragged(d,i) {
       d3.select("#resizeIcon_"+i).attr("display", "none");
       d.x += d3.event.dx;
       d.y += d3.event.dy;
       d3.select(this).attr("transform", function(d,i){
          return "translate(" + [ d.x,d.y ] + ")"
       })
}

function dragended(d,i) {
        d3.select("#resizeIcon_"+i).attr("transform", function(d,i){
           return "translate(" + [ (d.r/2),(d.r/2.5) ] + ")"
        })
       var newDataset = clone(dataset);
       var re = new recomEngine("drag", oldDataset, newDataset);
       re.scatterGetRecom(re);
}
