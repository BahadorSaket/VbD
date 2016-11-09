Scatterplot.prototype.Scatter_DragActivation= function(){
     // first remove all the events
     svg.selectAll("g").on(".drag", null);
     d3.selectAll(".colorPicker").remove();
     svg.selectAll("circle").on("dblclick", null);
     svg.selectAll("g.dot").on('mouseenter', null).on('mouseout', null);

     //then add some events
     svg.selectAll("circle").on('mouseenter', function(d,i) {
              ShowDetail(i);
     });
     svg.selectAll("g").call(Scatter_DragCircle);
}
