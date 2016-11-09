function Scatterplot(){

}

function onlyUnique(value, index, self) { // This function returns an array with unique elements
    return self.indexOf(value) === index;
}


function createScatterplot(chart, xAttr, yAttr, encoding, attr)
{
  d3.selectAll(".axis").remove();

  if(dataProcessor.getAttributeDetails(xAttr)["isCategorical"]=="1"
                  && dataProcessor.getAttributeDetails(xAttr)["isNumeric"]=="0")
  {
    var XExtentValue=[];
    for(i=0;i<dataset.length;i++)
    {
      XExtentValue.push(dataset[i][xAttr]);
    }
    XExtentValue = XExtentValue.filter(onlyUnique);
    var xScale= xScaleGenerator("ordinal", width, XExtentValue);
  }
  else
  {
    var xScale = d3.scale.linear().range([0, width]);
    xScale.domain(d3.extent(dataset, function(d) { return parseFloat(d[xAttr]); })).nice();
  }

  if(dataProcessor.getAttributeDetails(yAttr)["isCategorical"]=="1"
                  && dataProcessor.getAttributeDetails(yAttr)["isNumeric"]=="0")
  {
    var YExtentValue=[];
    for(i=0;i<dataset.length;i++)
    {
      XExtentValue.push(dataset[i][yAttr]);
    }
    YExtentValue = YExtentValue.filter(onlyUnique);
    var yScale= yScaleGenerator("ordinal", height, YExtentValue);
  }
  else
  {
    var yScale = d3.scale.linear().range([height, 0]);
    yScale.domain(d3.extent(dataset, function(d) { return parseFloat(d[yAttr]); })).nice();
  }

  var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

  var yAxis = d3.svg.axis().scale(yScale).orient("left");

  svg.selectAll('.dot')
     .transition()
     .delay(function(d,i) { return 200; })
     .duration(1000)
     .ease("linear")
     .attr("transform", function(d,i){
          return "translate("+xScale(d[xAttr])+","+yScale(d[yAttr])+")"
     });

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .append("text")
    .attr("class", "text axis")
    .attr("x", width)
    .attr("y", -6)
    .style("text-anchor", "end")
    .text(xAttr);

// y-axis
svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("class", "text axis")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text(yAttr);
}


function xScaleGenerator(xAxisType, width, XExtentValue)
{
    var xScale;
	if(xAxisType =="linear")
	{
		xScale = d3.scale.linear().domain(XExtentValue).range([0,width]);
	}
	else
	{
		xScale= d3.scale.ordinal().domain(XExtentValue).rangeRoundBands([0,width],1);
	}

	return xScale;
}


function yScaleGenerator(yAxisType, height, YExtentValue)
{
	var yScale;
	if(yAxisType =="linear")
	{
		yScale = d3.scale.linear().domain(YExtentValue).range([height, 0]);
	}
	else
	{
		yScale = d3.scale.ordinal().domain(YExtentValue).rangeRoundBands([height, 0],1);
	}
	return yScale;
}
