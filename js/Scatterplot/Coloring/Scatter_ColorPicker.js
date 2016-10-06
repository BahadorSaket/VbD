Scatterplot.prototype.Scatter_ColorPicker=function(dataPointId,defaultColor,colorScale)
{
  var self = this;
  var mainColor="#267bfb";
  var currentColor=d3.select("#id_"+dataPointId).attr("fill");
  var rainbow = ["#ffff99", "#00DB00", "#267bfb", "#DB007C", "#FF7400", "#FFAA00"];
  colorScale = colorScale || rainbow;
  var color = function (i) {
      return colorScale[i];
  };
  defaultColor = defaultColor || color(0);

  self.pickedColor = defaultColor;
  self.picked = function (color) {};
  var clicked = function () {
      self.picked(self.pickedColor);
  };

  var pie = d3.layout.pie().sort(null);
  var arc = d3.svg.arc().innerRadius(Number(d3.select("#id_"+dataPointId).attr("r"))*3)
                  .outerRadius(Number(d3.select("#id_"+dataPointId).attr("r"))*1.5);

  colorPickerX = d3.transform(d3.select("#g_id_"+dataPointId).attr("transform")).translate[0]+margin.left;
  colorPickerY = d3.transform(d3.select("#g_id_"+dataPointId).attr("transform")).translate[1]+margin.top;
  var svg = d3.select("body").select("#Vis")
      .append("g")
      .attr("class","colorPicker")
      .attr("transform", "translate("+colorPickerX+","+colorPickerY+")");

  $('#Vis').click( function(){
      d3.select(".colorPicker").remove();
  });

  svg.datum([1, 1, 1, 1, 1, 1])
      .selectAll("path")
      .data(pie)
      .enter()
      .append("path")
      .attr("fill", function (d, i) {
        return color(i);
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("d", arc)
      .on("mouseover", function () {
        var fill = d3.select(this).attr("fill");
        d3.select("#id_"+dataPointId).attr("fill",fill);
      })
      .on("mouseout", function () {
        d3.select("#id_"+dataPointId).attr("fill",mainColor);
      })
      .on("click", function () {
        mainColor=d3.select(this).attr("fill");
        d3.select(".colorPicker").remove();
      });
}
