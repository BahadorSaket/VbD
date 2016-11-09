Scatterplot.prototype.Scatter_ColorActivation= function(){
  var sc = new Scatterplot();
  svg.selectAll("g").on(".drag", null);
  d3.select(".resizeIcon").attr("display", "none");
  svg.selectAll("circle").on("dblclick", null);
  svg.selectAll("g.dot").on('mouseenter', function(d,i) {
         d3.select(".colorPicker").remove();
         sc.Scatter_ColorPicker(i);
  })
  svg.selectAll("circle").on('mouseenter', function(d,i) {
           ShowDetail(i);
  });

}
