var pymChild = new pym.Child();

var indicators = ["z_Business","z_CommDevOther","z_GlobalCapacity","z_Housing","z_ImpactFinance"];

d3.queue()
    .defer(d3.csv, "data/county13_2.csv")    
    .await(ready);

function ready(error, data) {    
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
	      // console.log(suggestion)
	      // CAll function that highlights selected line
	      // Highlight( suggestion.value )
	    }
	  } );

	// event for clicking on buttons to change data
	$('.switch.dots.second-in').on('click',function(){		
		$('.switch.dots.second-in').removeClass("active");
		update(data,$(this)["0"].attributes[2].nodeValue,y)
		$(this).addClass("active");
	})

	
	var breakpoint = 768,
		width = parseInt(d3.select("#chart").style("width"));

	// static parameters
	var spacer = 10,
		bubbleRadius = 4,
		bubbleSpacer = 3,
		bnMult = bubbleRadius*2+bubbleSpacer,
		topBubbleLevel = -8,
		yLineTop = 140,
		yLineX = -56,
		LineTextLeft = -51;


	// width based parameters
	if (width > breakpoint) {
		var margin = {top: 60, right: 10, bottom: 10, left: 100}
	} else {
		// Smaller viewports
		var margin = {top: 20, right: 10, bottom: 10, left: 10}
	}	

	var colorScale = d3.scaleOrdinal()
		.range(["#848081","#d5d5d4","#332d2f","#5c5859","#0096d2","#a2d4ec","#0a4c6a","#12719e","#fdbf11","#fce39e","#843215","#e88e2d"]);		

  	//////// mess with the data

  	var y = {}

	// create d3 key here. 
	var map = d3.map(data, function(d) { return d.id; });

	for (var k = 0; k < indicators.length; k++) {	
		// var extent = d3.extent(data, function(d) { return +d[indicators[k]]});
		var min = Math.floor(d3.min(data, function(d) { return +d[indicators[k]]}));
		// var max = Math.ceil(d3.max(data, function(d) { return +d[indicators[k]]}));
		var max = 3;		
		// if (indicators[k] === "z_Business") {
		// 	max = 3;
		// }
		// else if (indicators[k] === "z_CommDevOther") {
		// 	max = 3; 
		// }
		// else if (indicators[k] === "z_GlobalCapacity") {
		// 	max = 3;
		// }
		// else if (indicators[k] === "z_Housing") {
		// 	max = 3;
		// }
		// else if (indicators[k] === "z_ImpactFinance") {
		// 	max = 3;
		// }


		// Problem here!!!! 
		// Can only have (width/radius) balls per row. 

		var histogram = d3.histogram()
			.domain([min,max])
			.thresholds(100)
			.value(function(d,i,data) { 
				return +d[indicators[k]]; 
			})

		var bins = histogram(data)

		y[indicators[k]] = d3.scaleLinear()
			.domain([min,max])
			.range([bins.length*bnMult,0]); 

		y[indicators[k]].numBins = bins.length;


		for (var i = 0; i < bins.length; i++) {
			// bins[i].sort(function(a,b){return b[indicators[k]] - a[indicators[k]]  })
			for (var j = 0; j < bins[i].length; j++) {
				var now = map.get(bins[i][j].id);
				now[indicators[k] + "Index"] = j;
				now[indicators[k] + "Y"] = (bins[i].x1 + bins[i].x0)/2;
			}
		}
	}

	var chartHeight = 200 * (bubbleRadius*2);
	var svg = d3.select("#chart").append("svg")
	  .attr("width", width)
	  .attr("height", chartHeight + margin.top + margin.bottom);

  	// declare main g and stuff
  	var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  function update(data,indicator,y) {
  	var t = d3.transition()
      .duration(1500);

	// Index of county bubbles over the max height
    var overIndex = -1;
    // reset height and redraw based on width?
    
	
	var chartHeight = y[indicator].numBins*(bnMult),
		yLineBottom = chartHeight - 130;



	svg.attr("height",chartHeight+margin.top+margin.bottom)

	//remove existing yGrid lines	
	g.selectAll(".yGrid").remove()		
	g.selectAll(".yNum").remove()		

	for (var i = y[indicator].domain()[0]; i <= y[indicator].domain()[1]; i++) {
		g.append("line")
			.attr("class","yGrid")
			.attr("x1",function(d){
				if (i === 0) {
					return -75
				} else {
					return -40
				}
			})
			.attr("x2",width)
			.attr("y1",y[indicator](i))
			.attr("y2",y[indicator](i))

		g.append("text")
			.attr("class","yNum")
			.attr("x",function(d){
				if (i === 0) {
					return -60
				} else {
					return -35
				}
			})			
			.attr("y",y[indicator](i) - 5)
			.text(function(){
				if (i === y[indicator].domain()[1]) {
					return i + "+"
				} else {
					return i
				}
			})			
	}

	g.append("text")
		.attr("class","xText")
		.attr("x",0)
		.attr("y",-45)
		.text("Number of Counties")

	
	var numXticks = Math.floor((width-margin.left)/(bnMult)/5)

	// create x ticks
	for (var i = 1; i <= numXticks; i++) {
		g.append("text")
			.attr("class","xNum")
			.attr("x",function(d){
				return (i*(bnMult)*5 - (bnMult) + 1);
			})
			.attr("y",-20)
			.text(i*5)		
	}	
	
	// Lines and arrows and text
	g.append("line")
		.attr("class","yLine1")
		.attr("x1",yLineX)
		.attr("x2",yLineX)
		.attr("y1",yLineTop)
		.attr("y2",y[indicator](0) - 25)

	g.append("line")
		.attr("class","yLine1")
		.attr("x1",yLineX)
		.attr("x2",yLineX + 6)
		.attr("y1",yLineTop)
		.attr("y2",yLineTop + 5)		

	g.append("line")
		.attr("class","yLine1")
		.attr("x1",yLineX)
		.attr("x2",yLineX - 6)
		.attr("y1",yLineTop)
		.attr("y2",yLineTop + 5)				

	g.append("line")
		.attr("class","yLine2")
		.attr("x1",yLineX)
		.attr("x2",yLineX)
		.attr("y1",y[indicator](0) + 10)
		.attr("y2",yLineBottom)

	g.append("line")
		.attr("class","yLine2")
		.attr("x1",yLineX)
		.attr("x2",yLineX + 6)
		.attr("y1",yLineBottom)
		.attr("y2",yLineBottom - 5)		

	g.append("line")
		.attr("class","yLine2")
		.attr("x1",yLineX)
		.attr("x2",yLineX - 6)
		.attr("y1",yLineBottom)
		.attr("y2",yLineBottom - 5)				

	g.append("text")
		.attr("class","yLineText")
		.attr("x",-10)
		.attr("y",LineTextLeft)
		.attr("transform", function(d) {
	        return "rotate(-90)" 
        })
		.text("More Investment")

	g.append("text")
		.attr("class","yLineText end")
		.attr("x",-chartHeight + 10)
		.attr("y",LineTextLeft)
		.attr("transform", function(d) {
	        return "rotate(-90)" 
        })        
		.text("Less Investment")

	g.append("text")
		.attr("class","yLineText title")
		.attr("x",-10)
		.attr("y",LineTextLeft-30)
		.attr("transform", function(d) {
	        return "rotate(-90)" 
        })
		.text("Standard Deviations from Mean")

  	// data join
	var counties = g.selectAll("circle")
		.data(data, function(d) {return d.fips5; })


		// EXIT old elements not present in new data.
	counties.exit()
	  .attr("class", "county exit")
	.transition(t)
	  .style("fill-opacity", 1e-6)
	  .remove();

	  // update
  	counties.attr("class", "county update")
      .style("fill-opacity", 1)
    	.transition(t)
			.attr("cx", function (d) { 
				if (isNaN(d[indicator + "Y"])) {
					overIndex += 1;
					return overIndex*bnMult;
				}
				else {
					return d[indicator + "Index"]*bnMult;	
				}				
			})
			.attr("cy", function (d) { 	
				if (isNaN(d[indicator + "Y"])) {
					return topBubbleLevel;
				}	
				else {
					return y[indicator](d[indicator + "Y"])	
				}	
			})

	  // enter + update
	  counties.enter().append("circle")
      	.attr("class", "county enter")
			.attr("cx", function (d) { 
				if (isNaN(d[indicator + "Y"])) {
					overIndex += 1;
					return overIndex*bnMult;
				}
				else {
					return d[indicator + "Index"]*bnMult;	
				}		
			})
			.attr("cy", function (d) {
				if (isNaN(d[indicator + "Y"])) {
					return topBubbleLevel;
				}	
				else {
					return y[indicator](d[indicator + "Y"])	
				}	
			})
			.attr("r", bubbleRadius)
			.style("fill", function(d) {
				return "#1696D2"
			})
			.style("fill-opacity", 1e-6)
			.on("mouseover",function(d){
				d3.select(this)
					.attr("r",2*bubbleRadius)
					.classed("active",true)

			})
			.on("mouseout",function(d){
				d3.select(this)
					.attr("r",bubbleRadius)
					.classed("active",false)
			})
    	.transition(t)
    		.style("fill-opacity", 1);

  }

  // starting indicator?
  var indicator = "z_Housing"
  update(data,indicator,y)


}
