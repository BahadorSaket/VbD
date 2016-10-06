function YScaleGenerator(yAxisType, yRangeValue, height, YExtentValue,yPadding,yboundry)
	{
		var yScale;
		if(yAxisType =="linear")
		{
			yScale = d3.scale.linear().domain(YExtentValue).range([height-yboundry, yPadding]);
		}
		else
		{
			yScale = d3.scale.ordinal().domain(YExtentValue).rangeRoundBands([height-yboundry, yPadding],yRangeValue);	
		}
		return yScale;
	}