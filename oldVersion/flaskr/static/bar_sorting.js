function bar_sorting()
{             
    ascending = false;
    descending = false;
    d3.selectAll(".GroupBar").each( function(d,i)
    {
         var g = d3.select(this);
         var currentx = d3.transform(g.attr("transform")).translate[0];
         if(currentx < 0)
         {
         	descending = true;
            bar_moved_ID= g;     	
         } 
         else if(currentx > 800)
         {
         	ascending = true;
            bar_moved_ID= g; 
         }
    });
    var sorting_recom;
    if(ascending==true || descending==true)
    {
        var g = "#"+bar_moved_ID.attr("id");
	    var countGroup = $(g).children().length;
	    max = countGroup;
	    sorting_recom = true;
        d3.selectAll(".GroupBar").each( function(d,i)
	    {
	        curr_g = "#"+d3.select(this).attr("id");
	        curr_count = $(curr_g).children().length;
 	       // console.log(curr_count,max)
 	        if(curr_count > max)
 	        {
                sorting_recom =false;
 	        }  
        });

    }
    
    if(sorting_recom==true && ascending ==true)
    {
    	return "sorting,ascending";
    }
    else if(sorting_recom== true && descending == true)
    {
        return "sorting,descending";
    }
    

    

}

