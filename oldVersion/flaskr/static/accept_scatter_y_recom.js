
function accept_scatter_y_recom(recom, id)
{
    drag_Status =true;
	removeAllDynRecom("y");
	switch_case = id.split(',');
	id = get_recom_index(recom, id);		
    yAxis_value = data_set_attributes[Number(switch_case[0])];
    console.log("y", yAxis_value);								
	for(var i=0; i<data[0].length; i++) {
		transformed_data[i].y = data[Number(switch_case[0])][i];
	}
	turn_on_axis("y",yAxis_value);
	Update_ScatterPlot_y(transformed_data); 

}
