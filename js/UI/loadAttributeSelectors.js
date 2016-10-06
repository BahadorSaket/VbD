
function loadAttributSelectors(dataset){
  $('.axisselector').find('option').remove().end();
  	    $(".axisselector").append($("<option></option>").val('').html(''));
  	    $("#encoding-attribute-dropdown").append($("<option></option>").val('').html(''));
  	    var dataAttributes = Object.keys(dataset[0]);
  	    for(var i in dataAttributes){
            if(dataAttributes[i] != "ID" && dataAttributes[i] != "Name")
            {
              var dataAttribute = dataAttributes[i];
              $(".axisselector").append($("<option></option>").val(dataAttribute).html(dataAttribute));
            }

  	}
}
