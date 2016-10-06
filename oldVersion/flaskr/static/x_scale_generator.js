function XScaleGenerator(xAxisType, xRangeValue, width, XExtentValue,xPadding,xboundry)
	{ 
	    var xScale;
		if(xAxisType =="linear")
		{
			xScale = d3.scale.linear().domain(XExtentValue).range([xPadding,width-xboundry]);
		}
		else
		{
			xScale= d3.scale.ordinal().domain(XExtentValue).rangeRoundBands([xPadding,width-xboundry],xRangeValue);	
		}
		
		return xScale;
	}