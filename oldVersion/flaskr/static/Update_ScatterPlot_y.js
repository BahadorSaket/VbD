function Update_ScatterPlot_y(transformed_data)
	{
	
	    Scale_MyData_y(transformed_data);
        yAxis = d3.svg.axis()
		              .scale(yScale)
					  .orient("left");
				
        svg.selectAll('.state')
				.transition()
				.delay(function(d,i) { return 100; })
				.duration(1000)
				.ease("linear")
		        .attr("cy", function(d,i) { 
                               id = d3.select(this).attr("id").split("_")[1];
                               selection_id = "id_"+id;
		                       return transformed_data[getIndexBasedOnId(selection_id)].y; 
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
    

  

		svg.select(".y")
           .attr("transform", "translate("+(padding)+"," + (0) + ")")
           .call(yAxis);	   
	}
	