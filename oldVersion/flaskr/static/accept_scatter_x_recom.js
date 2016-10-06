function accept_scatter_x_recom(recom, id)
{
	
	removeAllDynRecom("x");
				
	switch_case = id.split(',');
	id = get_recom_index(recom, id);
                          
    xAxis_value = data_set_attributes[Number(switch_case[0])];	

    for(var i=0; i<data[0].length; i++) {
		transformed_data[i].x = data[Number(switch_case[0])][i];
	}
	console.log();
	turn_on_axis("x",xAxis_value);
	Update_ScatterPlot_x(transformed_data);
}