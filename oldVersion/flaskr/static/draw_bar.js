function appdGroupToRect()
     { 
         d3.selectAll(".GroupBar").each( function(d)
         {
               $("#bar_"+i).removeAttr("transform");
         });  
         d3.selectAll(".RectBar").each( function(d)
         {         	  
         	  CurrRect = d3.select(this)//d3.select("#rectBar_" + i);         	  
         	  CurrRectID = "#"+CurrRect.attr("id");
         	  CurrRect_x = parseFloat(CurrRect.attr("x"));
         	  curRect_width = parseFloat(CurrRect.attr("width"));
         	  d3.selectAll("circle").each(function(g)
              {      
              		var curCircle = d3.select(this)
              		var CurrcircleID = "#" + curCircle.attr("id");         	  	    	
              		var cx1= parseFloat(curCircle.attr("cx"));
         	  	    if( (cx1 >= CurrRect_x) && (cx1 < (CurrRect_x+curRect_width)) )
         	  	    {
         	  	    	$(CurrcircleID).insertAfter(CurrRectID);
         	  	    }
         	  });

         });

     }

function RemoveGrouping()
{
       d3.selectAll(".state").each(function(g)
        {
            CircleID = d3.select(this).attr("id");
            $("#"+CircleID).insertBefore(".x");    
       });

       d3.selectAll(".handler").each(function(g)
        {
            CircleID = d3.select(this).attr("id");
            $("#"+CircleID).insertBefore(".x");    
       });
  
       d3.selectAll(".GroupBar").remove();
}

function getAttrValue(i,curAttr)
	{
	  for(j=0;j<data_set_attributes.length;	j=j+1)
	  {
	  	if(data_set_attributes[j]==curAttr){
	  		return data[j][i];
	    }
	  }	  
	}

function getIndexBasedOnId(id){	
	for(var i in transformed_data){
		if(transformed_data[i]['dataId']==id){
			return i;
		}
	}
}

function resetRadius()
{
	  for(i=0;i<transformed_data.length;i++)
      {
    	  transformed_data[i].Radius = radius;
      }
	  d3.selectAll(".state").each( function(d,i)
         {
              d3.select(this).attr("r", transformed_data[i].Radius);
         });  
}

function draw_bar(data_temp,xAxis_value, yAxis_value,bar_orientation,radius,bar_order)
	{
		var barData = {};
		var ValueExtent=[];
		
		for(var index in data_temp){
			var curObj = data_temp[index].toString();
			if(Object.keys(barData).indexOf(curObj)==-1){
				barData[curObj] = 1;
			}else{
				barData[curObj]++;
			}			
		}
        for(var index in barData){
             ValueExtent.push(barData[index]); 
		}
	
	    
	    XExtentValue = Object.keys(barData); 
		var YExtentValue = [0,d3.max(ValueExtent)];
		val=1;
		//console.log(XExtentValue)
	  

	    if(bar_order == "ascending")
	    {   
	    	  XExtentValue = Object.keys(barData).sort(function(a,b){return barData[a]-barData[b]});
	          
	    	  //XExtentValue = Object.keys(barData); 
	    }
	    else if(bar_order == "descending")
	    {
	          XExtentValue= Object.keys(barData).sort(function(a,b){return barData[b]-barData[a]});
	    	 // XExtentValue = Object.keys(barData); 
	    }
		var xScale = XScaleGenerator("Ordinal",1, (width-padding), XExtentValue,padding,0);
		var yScale = YScaleGenerator("linear",0, (d3.max(ValueExtent)*(radius*2)+(radius*2)+padding), YExtentValue,padding,0);	
       

	      
		xAxis = d3.svg.axis()
			          .scale(xScale)
					  .orient("bottom");
   
        yAxis = d3.svg.axis()
		              .scale(yScale)
					  .orient("left").ticks(d3.max(ValueExtent)-1);;;

    x=0;
    y=0;


	svg.selectAll("rect").data(XExtentValue)
					 .enter()
				     .append("g")
				     .attr("class","GroupBar")
				     .call(drag)
				     .attr("id",function(d,i) { return "bar_"+i;})
					 .on('mouseenter', function(d,i) {
						   d3.select(".inner-div4").selectAll("circle").classed("recomSelect",false);
						   d3.select("#bar_"+i).selectAll("circle").each(function(g,j)
						    { 
							    id =d3.select(this).attr("id");
								d3.select(".inner-div4").selectAll("#"+id).classed("recomSelect",true);	
							});
					       	
 			         })
					 .on('mouseleave', function(d,i) {
					        d3.select("#bar_"+i).selectAll("circle").each(function(g,j)
						    { 
							    id =d3.select(this).attr("id");
								d3.select(".inner-div4").selectAll("#"+id).classed("recomSelect",false);	
							});

 			          })
				     .append("rect")
					 .attr("class", "bar") 
					 .attr("class","RectBar")
					 .attr("id",function(d,i) { return "rectBar_"+i;})	
					 .attr("x",function(d,i) {
					            return xScale(XExtentValue[i])-radius- (radius/2);
					        })
					 .attr("y",function(d,i) {
					            return (height-radius*2) - barData[XExtentValue[i]]*radius*2 - padding;
					        })
					 .attr("width",radius*2+radius)
			         .attr("height", function(d,i) {
					           return (barData[XExtentValue[i]]*radius*2+radius*2);
						   })
				    
    resetRadius();


	d3.selectAll('.state')
	       .transition()
		   .delay(function(d) { return 5;})
		   .duration(50)
		   .ease("linear")
		   .attr("cx", function(d,i){ 
			   	                    transformed_data[getIndexBasedOnId(d3.select(this).attr("id"))].x= xScale(getAttrValue(getIndexBasedOnId(d3.select(this).attr("id")),xAxis_value));
									return transformed_data[getIndexBasedOnId(d3.select(this).attr("id"))].x;
								
								})
		   .attr("cy", function(d,i) {
		   	               
		   	                        var tempData_data_temp = getAttrValue(getIndexBasedOnId(d3.select(this).attr("id")),xAxis_value);
			   				        var transformed_dataIndex = getIndexBasedOnId(d3.select(this).attr("id"));
									barData[tempData_data_temp.toString()] --;
	                                transformed_data[transformed_dataIndex].y=(height-radius*2) - barData[tempData_data_temp.toString()]*radius*2 - padding; 										  
									return (height-radius*2) - barData[tempData_data_temp.toString()]*radius*2 - padding;		
			   	               
		   				     
		                        });
    

    d3.selectAll('.handler')
		   .attr("cx", function(d,i){ 
		   	                        id = d3.select(this).attr("id").split("_")[1];
                                    selection_id = "id_"+id;
									return (transformed_data[getIndexBasedOnId(selection_id)].x + Number(transformed_data[getIndexBasedOnId(selection_id)].Radius));
								})
		   .attr("cy", function(d,i) {	
		                            id = d3.select(this).attr("id").split("_")[1];
                                    selection_id = "id_"+id;					  
									return transformed_data[getIndexBasedOnId(selection_id)].y;		
		                        });


    setTimeout(function() { appdGroupToRect(); }, 1000);
	
	 
   

    svg.select(".x") // change the x axis
		   .call(xAxis);
    
    svg.select(".y")
           .attr("transform", "translate("+(padding)+"," + (height - (d3.max(ValueExtent)*(radius*2)+(radius*2) + padding) - padding ) + ")")
           .call(yAxis);
	   
	}
	
	