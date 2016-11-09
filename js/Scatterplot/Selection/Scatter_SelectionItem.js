Scatterplot.prototype.Scatter_SelectionItem= function(){
  var listSelectedItems = [];
  d3.selectAll("circle").each(function(d,i) {
    if(d3.select(this).classed('selected'))
    {
      listSelectedItems.push(i);
    }
  });
  var newDataset = clone(dataset);
  var re = new recomEngine("select","","",listSelectedItems);
  re.scatterGetRecom(re);
}
