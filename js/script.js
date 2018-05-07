var pymChild = new pym.Child();

d3.queue()
    .defer(d3.csv, "data/county_v12.csv")    
    .await(ready);

function ready(error, data) {    
	console.log(data)

	// mess with the data as needed
	// remove too small data?


	// build the chart margins and container in d3
	
	var breakpoint = 768,
		width = parseInt(d3.select("#chart").style("width"));

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

	console.log(chartHeight)
  	 
  var chartWidth = width - margin.left-margin.right;

	var svg = d3.select("#chart").append("svg")
	  .attr("width", width)
	  .attr("height", chartHeight + margin.top + margin.bottom);

  	// declare main g and stuff
  var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + 0 + ")");

  function update(data) {
  	var t = d3.transition()
      .duration(750);

	  var y = d3.scaleLinear()
		  .domain(d3.extent(data.map(function(d){ return +d.z_GlobalCapacity})))
		  .range([0, chartWidth-(spaceForLabelsLeft+spaceForLabelsRight)]);      

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
				return chartWidth*Math.random()
			})
			.attr("cy", function (d,i) { 
				
				return i % 1000;
			})

	  // enter + update
	  counties.enter().append("circle")
      	.attr("class", "enter")
				.attr("cx", function (d) { 
					return chartWidth*Math.random()
				})
				.attr("cy", function (d,i) { 
					console.log(d)
					return y(d.z_GlobalCapacity);
				})
				.attr("r", bubbleRadius)
				.style("fill", function(d) {
					return "#ff00ff"
				})
				.style("fill-opacity", 1e-6)
    	.transition(t)
    		.style("fill-opacity", 1);

  }

  update(data)

	// Grab a random sample of letters from the alphabet, in alphabetical order.
	// d3.interval(function() {
	//   update(d3.shuffle(data)
	//       .slice(0, Math.floor(Math.random() * 1000))
	//       .sort());
	// }, 1500);

}
