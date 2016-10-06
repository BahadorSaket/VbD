Scatterplot.prototype.Scatter_ResizeActivation= function(){
       svg.selectAll("g.dot").on('mouseenter', null).on('mouseout', null);
       svg.selectAll("g").on(".drag", null);
       d3.selectAll(".colorPicker").remove();
       d3.select(".resizeIcon").attr("display", "none");
       svg.selectAll("circle")
          .on('mouseenter', function(d,i) {
                d3.selectAll(".resizeIcon").attr("display", "none");
                d3.select("#resizeIcon_"+i).attr("display", "Active");
                ShowDetail(i);
          })
          .on('mouseout', function(d,i) {
                d3.select("#resizeIcon_"+i).attr("display", "none");
                          //  d3.selectAll(".resizeIcon").attr("display", "none");
          });
       svg.selectAll("g.resizeIcon").call(Scatter_ResizeCircle)
          .on('mouseenter', function(d,i) {
                   d3.select("#resizeIcon_"+i).attr("display", "Active");
                   $('#resizeIcon_'+i).css('cursor', 'pointer');
          });
}
