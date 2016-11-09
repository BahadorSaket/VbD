Scatterplot.prototype.Scatter_SelectionActivation= function(){
  var sc = new Scatterplot();
  svg.selectAll("g").on(".drag", null);
  d3.selectAll(".colorPicker").remove();
  svg.selectAll("g.dot").on('mouseenter', null).on('mouseout', null);

  svg.selectAll("circle").on('mouseenter', function(d,i) {
      ShowDetail(i);
  });

  svg.selectAll("circle").on("dblclick",function(d,i){
    if(!d3.select(this).classed('selected'))
    {
      d3.select(this).classed('selected',true);
      sc.Scatter_SelectionItem();
    }
  });

}
