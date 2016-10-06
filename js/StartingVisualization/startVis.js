function startVis (dataset) {
  originalColor ="#267bfb";
  originalRadius = 6;

  margin = {top: 10, right: 100, bottom: 60, left: 90},
  width = (67/100)* window.innerWidth;- margin.left - margin.right,
  height = (80/100)* window.innerHeight; - margin.top - margin.bottom;
  svg = d3.select("body").select("#VisContainer").append("svg")
              .attr("id","Vis")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  gdots =  svg.selectAll("g.dot")
              .data(dataset)
              .enter().append('g')
              .attr("class", "dot")
              .attr("id", function(d,i){return "g_id_"+d.ID;})
              .attr("transform", function(d,i){
                    d.x = Math.floor((Math.random() * width ));
                    d.y = Math.floor((Math.random() * height));
                    return "translate("+d.x+","+d.y+")"
              });
                  //.call(dragCircle);

  gdots.append("circle")
       .attr("class", "dot")
       .attr("fill", function(d,i){
         d.color = originalColor;
         return d.color;
       })
       .style("opacity", 0.5)
       .attr("id", function(d,i){return "id_"+d.ID;})
       .attr("r", function(d){
              d.r = originalRadius;
              return d.r;
        })
        .on('mouseenter', function(d,i) {
              ShowDetail(i);
        })

  gIcons =  svg.selectAll("g.Icon")
               .data(dataset)
               .enter().append('g')
               .attr("class", "resizeIcon")
               .attr("id", function(d,i){return "resizeIcon_"+d.ID;})
               .attr("transform", function(d,i){
                     return "translate("+(d.x+d.r/3)+","+ (d.y+d.r/2.5)+")";
               })
               .attr("display", "none");

  gIcons.append('text')
        .attr('font-family', 'FontAwesome')
        .attr('font-size', "8px" )
        .attr("font-weight","bold")
        .attr("fill", "white")
        .text(function(d) { return '\uf07e' });

}
