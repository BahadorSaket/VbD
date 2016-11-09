
function generateRecom(bar_orientation, rec_X,rec_Y,Recommendation,xAxis_value,sorting,clusters)
	{
		//console.log(clusters);

		Recommendation = generate_scatterPlot_Recom(rec_X,rec_Y,Recommendation);
		//console.log(Recommendation);
		if(bar_orientation!="")
			Recommendation = generate_bar_Recom(bar_orientation, Recommendation);
        if(sorting!="")
		    Recommendation = sorting_bar(sorting,xAxis_value, Recommendation);
		if(clusters.length!=0)
			Recommendation = generate_color_recom(clusters);
        return Recommendation;
	}


function generate_color_recom(clusters)
	{

     var recom_name=[];
	 for(i=0;i<clusters.length;i++)
	 {
         recom_name.push(clusters[i]+",cluster");
	 }
	 Recommendation = check_avl_Recom(recom_name);
	 return Recommendation;

	}



function check_avl_Recom(recom_name)
{
	//console.log(recom_name);
	for(i=0;i<recom_name.length;i++)
	    {
	          check_recom_existance = false;
			  for(j=0;j<Recommendation.length;j++)
			  {
			     if(Recommendation[j].id == recom_name[i])
				 {
				    check_recom_existance = true;
					index_of_existing_recom = j;
				 }
			  }
			  if(check_recom_existance==false)
			  {

	             Recommendation.push({value: 1, weight: 0, id:recom_name[i], AddPercentage:0.3});
			  }
			  else
			  {
			     Recommendation[index_of_existing_recom].weight = Recommendation[index_of_existing_recom].weight + Recommendation[index_of_existing_recom].AddPercentage;
			  }
	    }
	return Recommendation;

}


function sortWithIndeces(toSort) {
  for (var i = 0; i < toSort.length; i++) {
    toSort[i] = [toSort[i], i];
  }
  toSort.sort(function(left, right) {
    return left[0] < right[0] ? -1 : 1;
  });
  toSort.sortIndices = [];
  for (var j = 0; j < toSort.length; j++) {
    toSort.sortIndices.push(toSort[j][1]);
    toSort[j] = toSort[j][0];
  }
  return toSort;
}




function generate_scatterPlot_Recom(rec_X,rec_Y,Recommendation)
{

     x_recoms_cluster=[];
     y_recoms_cluster=[];

     var k_counter =0;

     x_recoms = sortWithIndeces(rec_X.Score);

     x_recoms = x_recoms.sortIndices.join(",");

     x_recoms=x_recoms.split(",")

	 for(k=0;k<x_recoms.length;k++)
     {
        if(Number(x_recoms[k]) > 4 && Number(x_recoms[k]) != 14 )
        {
            x_recoms_cluster[k_counter] = x_recoms[k];
            k_counter ++;
        }
     }

     y_recoms = sortWithIndeces(rec_Y.Score);
     y_recoms = y_recoms.sortIndices.join(",");
     y_recoms= y_recoms.split(",");

     k_counter = 0;
    for(k=0;k<y_recoms.length;k++)
     {
        if(Number(y_recoms[k]) > 4)
        {
            y_recoms_cluster[k_counter] = y_recoms[k];
            k_counter ++;
        }
     }

	 var recom_name= [x_recoms_cluster[0]+","+"x",x_recoms_cluster[1]+","+"x", "10,x",
	                  y_recoms_cluster[0]+","+"y",y_recoms_cluster[1]+","+"y",
	                  x_recoms[0]+","+y_recoms[0], x_recoms[0]+","+y_recoms[1], x_recoms[1]+","+y_recoms[0], x_recoms[1]+","+y_recoms[1]];

	 Recommendation = check_avl_Recom(recom_name);
	 //console.log(recom_name);
	 return Recommendation;

}

function generate_bar_Recom(bar_orientation, Recommendation)
    {
		var recom_name=[];
		for(j=0;j<Recommendation.length;j++)
	    {
		    if(Recommendation[j].id!=0)
			{
			   str = Recommendation[j].id;
		       var val = str.split(',');
			   if(val[1] == "x" &&  bar_orientation == "vertical")
			   {
			      recom_name.push(val[0].toString()+",vertical");

			   }
			}
		}

	    Recommendation = check_avl_Recom(recom_name);
		return Recommendation;

    }

 function sorting_bar(sorting,xAxis_value, Recommendation)
    {
		var recom_name=[];
		var val =$(".xLabelHide").text();
		var val_number;
		for(i=0;i<data_set_attributes.length;i++)
		{
			if(data_set_attributes[i] == val)
				val_number = i;
		}
		recom_name.push(val_number+","+val+","+ sorting);
	    Recommendation = check_avl_Recom(recom_name);

		return Recommendation;

    }
