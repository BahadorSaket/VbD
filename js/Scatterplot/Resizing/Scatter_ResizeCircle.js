var Scatter_ResizeCircle = d3.behavior.drag()
    .origin(function(d) { return d; })
    .on("dragstart", dragstarted)
    .on("drag", dragged)
    .on("dragend", dragended);

  function dragstarted(d,i) {
    startingPosX = d3.transform(d3.select("#resizeIcon_"+i).attr("transform")).translate[0];
    startingPosY = d3.transform(d3.select("#resizeIcon_"+i).attr("transform")).translate[1];
    d3.event.sourceEvent.stopPropagation();
    d3.select(this).classed("dragging", true);
  }

  function dragged(d,i) {
      draggingRadius = d3.event.x - startingPosX + d.r;
      if(  draggingRadius >5  &&   draggingRadius <14)
      {
        d.x += d3.event.dx;
        d.y += d3.event.dy;
        d3.select("#id_"+i).attr("r",draggingRadius);
        d3.select(this).attr("transform", function(d,i){
            return "translate(" + [ d.x,(startingPosY)  ] + ")"
        })
      }
      //d.r = draggingRadius;

  }

  function dragended(d,i) {
      d.r=Number(d3.select("#id_"+i).attr("r"));

   //   d3.select(this).classed("dragging", false);

  }
