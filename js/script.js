var pymChild = new pym.Child();

var indicators = ["z_Business","z_CommDevOther","z_GlobalCapacity","z_Housing","z_ImpactFinance"];

d3.queue()
    .defer(d3.csv, "data/county13_2.csv")    
    .await(ready);

function ready(error, data) {    
	// console.log(data)

	// mess with the data as needed
	// remove too small data?

	// https://bl.ocks.org/officeofjane/7e70dc106a6f4c0e5163f994a5f1c219

	// build the chart margins and container in d3

	var test = [
	{value:"Switzerland",data:"test"},
	{value:"Azerbaijan",data:"test"},	
	{value:"Madagascar",data:"test"}];

	// make data searchable in autocomplete by adding the value category. 
	data.forEach(function(d){		
		d.value = d.CountyName + " County, " + d.State;
	})

	// autocomplete call
	$( '#autocompletez').autocomplete( {
	    lookup: data,
	    lookupLimit: 10,
	    maxHeight: 350,
	    showNoSuggestionNotice: true,
	    noSuggestionNotice: function () {
	      return "No county found"
	    },
	    onSelect: function ( suggestion ) {
	      console.log(suggestion)
	      // CAll function that highlights selected line
	      // Highlight( suggestion.value )
	    }
	  } );

	// event for clicking on buttons to change data
	$('input[type="button"]').on('click',function(){  	
		$('input[type="button"]').removeClass("active");	
		update(data,this.name)
		$(this).addClass("active");
	});

	
	var breakpoint = 768,
		width = parseInt(d3.select("#chart").style("width")) * 3;

	// static parameters
	var spacer = 10,
		bubbleRadius = 5;

	// width based parameters
	if (width > breakpoint) {
		var margin = {top: 10, right: 10, bottom: 20, left: 130},
			height = 1000,
			gapBetweenGroups = 20,
			spaceForLabelsLeft   = 80,
			spaceForLabelsRight = 30
	} else {
		// Smaller viewports
		var margin = {top: 10, right: 10, bottom: 10, left: 30},
			height = 500,			
			spaceForLabelsLeft   = 30,
			spaceForLabelsRight = 30
	}

	// var chartHeight = data.length * (bubbleRadius*2);
	var chartHeight = 200 * (bubbleRadius*2);

	var colorScale = d3.scaleOrdinal()
		.range(["#848081","#d5d5d4","#332d2f","#5c5859","#0096d2","#a2d4ec","#0a4c6a","#12719e","#fdbf11","#fce39e","#843215","#e88e2d"]);		

	
  	 
	var chartWidth = (width/3) - margin.left-margin.right;

	var svg = d3.select("#chart").append("svg")
	  .attr("width", width)
	  .attr("height", chartHeight + margin.top + margin.bottom);

  	// declare main g and stuff
  	var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + 0 + ")");

  	//////// mess with the data

  	var y = {}

	console.log(data)

	// create d3 key here. 
	var map = d3.map(data, function(d) { return d.id; });

	for (var k = 0; k < indicators.length; k++) {	
		// var extent = d3.extent(data, function(d) { return +d[indicators[k]]});
		var min = Math.floor(d3.min(data, function(d) { return +d[indicators[k]]}));
		var max = Math.ceil(d3.max(data, function(d) { return +d[indicators[k]]}));
		
		// Problem here!!!! 
		// Can only have (width/radius) balls per row. 

		var histogram = d3.histogram()
			.domain([min,max])
			.thresholds(109)
			.value(function(d,i,data) { 
				return +d[indicators[k]]; 
			})

		var bins = histogram(data)

		y[indicators[k]] = d3.scaleLinear()
			.domain([min,max])
			.range([chartWidth-(spaceForLabelsLeft+spaceForLabelsRight),0]); 

		for (var i = 0; i < bins.length; i++) {
			// bins[i].sort(function(a,b){return b[indicators[k]] - a[indicators[k]]  })
			for (var j = 0; j < bins[i].length; j++) {
				var now = map.get(bins[i][j].id);
				now[indicators[k] + "Index"] = j;
				now[indicators[k] + "Y"] = (bins[i].x1 + bins[i].x0)/2;
				
			}
		}
	}
	

  function update(data,indicator) {
  	var t = d3.transition()
      .duration(750);

    console.log(y)

  	// data join
	  var counties = g.selectAll("circle")
	  	.data(data, function(d) {return d.fips5; });

	 	// EXIT old elements not present in new data.
	  counties.exit()
	      .attr("class", "exit")
	    .transition(t)
	      .style("fill-opacity", 1e-6)
	      .remove();

	  // update
  	counties.attr("class", "update")
      .style("fill-opacity", 1)
    	.transition(t)
			.attr("cx", function (d) { 
				return d[indicator + "Index"]*bubbleRadius*2.5;
			})
			.attr("cy", function (d,i) { 					
				return y[indicator](d[indicator + "Y"])
				// return y["z_GlobalCapacity"](d.z_GlobalCapacity);
			})

	  // enter + update
	  counties.enter().append("circle")
      	.attr("class", "enter")
			.attr("cx", function (d) { 
				return d[indicator + "Index"]*bubbleRadius*2.5;
			})
			.attr("cy", function (d,i) { 					
				return y[indicator](d[indicator + "Y"])
				// return y["z_GlobalCapacity"](d.z_GlobalCapacity);
			})
			.attr("r", bubbleRadius)
			.style("fill", function(d) {
				return "#ff00ff"
			})
			.style("fill-opacity", 1e-6)
    	.transition(t)
    		.style("fill-opacity", 1);

  }

  var indicator = "z_GlobalCapacity"
  update(data,indicator)

	// Grab a random sample of letters from the alphabet, in alphabetical order.
	// d3.interval(function() {
	//   update(d3.shuffle(data)
	//       .slice(0, Math.floor(Math.random() * 1000))
	//       .sort());
	// }, 1500);

}
