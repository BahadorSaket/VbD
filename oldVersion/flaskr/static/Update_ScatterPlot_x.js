
	function Update_ScatterPlot_x(transformed_data)
	{
	
	     console.log("my data here")

	     console.log(transformed_data);

	    Scale_MyData_x(transformed_data);
		xAxis = d3.svg.axis()
			          .scale(xScale)
					  .orient("bottom");
	 
        svg.selectAll('.state')
				.transition()
				.delay(function(d,i) { return 100; })
				.duration(1000)
				.ease("linear")
			    .attr("cx", function(d,i) { 
                               id = d3.select(this).attr("id").split("_")[1];
                               selection_id = "id_"+id;
		                       return transformed_data[getIndexBasedOnId(selection_id)].x; 
		         })

	    d3.selectAll('.handler')
	    		.transition()
				.delay(function(d,i) { return 100; })
		    	.duration(1000)
				.ease("linear")
		   		.attr("cx", function(d,i){ 
		   			                id = d3.select(this).attr("id").split("_")[1];
                                    selection_id = "id_"+id;					  
									return (transformed_data[getIndexBasedOnId(selection_id)].x + Number(transformed_data[getIndexBasedOnId(selection_id)].Radius));
								})
		   		.attr("cy", function(d,i) {			
		   		                    id = d3.select(this).attr("id").split("_")[1];
                                    selection_id = "id_"+id;		  
									return transformed_data[getIndexBasedOnId(selection_id)].y;;		
		                        });
		svg.select(".x") // change the x axis
		   .call(xAxis); 	   
	}