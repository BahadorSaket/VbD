var min_difference_threshold=4;
var max_difference_threshold=8;

function check_collison_orientation(x1, x2, y1, y2, r1, r2, lastCircleDragged_id)
    {
	   r1 = parseFloat(r1,10);
       r2 = parseFloat(r2,10);
	   var RDistnace= Math.sqrt((Math.pow((x2 - x1),2)) +  Math.pow(y2 - y1,2)) 
	   if((Math.abs(r2- r1) < RDistnace ) && (RDistnace <= (r1 + r2)) )
	   {	
             // checks if two circles are overlapping vertically
            if((Math.abs(x1-x2)<min_difference_threshold) 
				 && (Math.abs(y1-y2)> max_difference_threshold)  
			     && (Math.abs(y2- y1)> Math.abs(x2- x1)))   
			{
			     return "vertical";
			}
			else if( (Math.abs(y1-y2)< min_difference_threshold) 
				 && (Math.abs(x1-x2)> max_difference_threshold) 
			     && (Math.abs(y2- y1) < Math.abs(x2- x1)))  
			{
				 return "horizontal";
			}
	   }	
	}
	
function check_collison(lastCircleDragged_id)
{             
			var lastCircleDragged = d3.select("#id_" + (lastCircleDragged_id));
			var checker= false;
		    var colision_orientation="";
			// it will compare the position of every single circle with the last moved circle.. If they overlap it will draw the bar chart
	    	d3.selectAll("circle").each( function(d, i)
			{
			    orientation = check_collison_orientation(lastCircleDragged.attr("cx"), d3.select(this).attr("cx"), lastCircleDragged.attr("cy"), 
				                        d3.select(this).attr("cy"),lastCircleDragged.attr("r"), d3.select(this).attr("r"),lastCircleDragged_id)
			
			    if(orientation=="vertical" && checker==false)
				{ 
					 colision_orientation="vertical";
                     checker= true;					 
				}					
			    else if(orientation=="horizontal" && checker==false)
		        {
					colision_orientation="horizontal";
                    checker= true;		 
			    } 
			}); 
			return colision_orientation;
}

	