var StartIndex = 0;
var pymChild = new pym.Child();
var indicator;
var isOpened = false;
var formatComma = d3.format(",");
var indicators = ["z_Business","z_CommDevOther","z_GlobalCapacity","z_Housing","z_ImpactFinance"];
var indicatorKey = {
	"z_Business":{
		"variable":"Business",
		"proper":"Small Business",
		"details": "Small business includes Community Reinvestment Act–reported bank small business lending. "
	},
	"z_CommDevOther":{
		"variable":"CommDevOther",
		"proper":"Other Community Development",
		"details": "Other community development includes HUD Community Development Block Grant, HUD Section 108 lending, and US Department of Education Promise Neighborhoods awards."
	},
	"z_GlobalCapacity":{
		"variable":"GlobalCapacity",
		"proper":"Combined",
		"details": ""
	},
	"z_Housing":{
		"variable":"Housing",
		"proper":"Housing",
		"details": "Housing includes US Department of Housing and Urban Development (HUD) HOME awards, low-income housing tax credit allocations, HUD Choice Neighborhoods awards, and investment deployment by the Community Development Financial Institution (CDFI) Capital Magnet Fund awards."
	},
	"z_ImpactFinance":{
		"variable":"ImpactFinance",
		"proper":"Impact Finance",
		"details": "Impact finance includes CDFI lending and New Markets Tax Credit Program investments."
	}
}
var ranks = {
	"z_Business":{
		"small":{
			"top":[],
			"bottom":[]
		},
		"midsize": {
			"top":[],
			"bottom":[]
		},
		"large":{
			"top":[],
			"bottom":[]
		}
	},
	"z_CommDevOther":{
		"small":{
			"top":[],
			"bottom":[]
		},
		"midsize": {
			"top":[],
			"bottom":[]
		},
		"large":{
			"top":[],
			"bottom":[]
		}
	},
	"z_GlobalCapacity":{
		"small":{
			"top":[],
			"bottom":[]
		},
		"midsize": {
			"top":[],
			"bottom":[]
		},
		"large":{
			"top":[],
			"bottom":[]
		}
	},
	"z_Housing":{
		"small":{
			"top":[],
			"bottom":[]
		},
		"midsize": {
			"top":[],
			"bottom":[]
		},
		"large":{
			"top":[],
			"bottom":[]
		}
	},
	"z_ImpactFinance":{
		"small":{
			"top":[],
			"bottom":[]
		},
		"midsize": {
			"top":[],
			"bottom":[]
		},
		"large":{
			"top":[],
			"bottom":[]
		}
	}
}

var suffixes = ["th", "st", "nd", "rd"];

function suffix(number) {
  var tail = number % 100;
  return suffixes[(tail < 11 || tail > 13) && (tail % 10)] || suffixes[0];
}


function findSize(binNum) {
	if (binNum === 2) {
		var name = 'small',
		desc = '*Small counties have populations between 50,000 and 99,999 people'
	} else if (binNum === 3) {
		var name = 'midsize',
		desc = '*Midsize counties have populations between 100,000 and 299,999 people'
	} else {
		var name = 'large',
		desc = '*Large counties have populations of more than 300,000 people'
	}

	return {"name":name,"desc":desc}
}

// color function for the map and the dots
function colorList(d,num) {

	var colorList6 = ["#a2d4ec","#73bfe2","#46abdb","#1696d2","#12719e","#000000"];
	var colorList5 = ["#73bfe2","#46abdb","#1696d2","#12719e","#000000"];
	

	if (num === 5) {
		var index = Math.ceil(d) + 1 > num - 1 ? (num-1) : Math.ceil(d);	
	} else {
		var index = Math.ceil(d) + 1 > num - 1 ? (num-1) : Math.ceil(d)+1;
	}

	if (index < 0) {index = 0}

	var color = num === 5 ? colorList5[index] : colorList6[index]
	
	return color;
}

// move to front function for the map
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

d3.queue()
    .defer(d3.csv, "data/county14_2.csv")    
    .defer(d3.json, "data/counties_20m.json")    
    .await(ready);

function ready(error, data, topo) {    
	// make data searchable in autocomplete by adding the value category. 
	data.forEach(function(d){
		d.value = d.CountyName + " County, " + d.State;
	})

	var fipsIndex = d3.map(data, function(d) { return d.fips5; });	

	//define ranks for table
	ranker(ranks,data) 

	// fix the topo fips code error (make 4 become 5)
	for (var i = 0; i < topo.objects.counties.geometries.length; i++) {
		if (topo.objects.counties.geometries[i].id.toString().length === 4) {
			topo.objects.counties.geometries[i].id = "0" + topo.objects.counties.geometries[i].id
		}
	}

  // CHANGE DATA SET
  $( "#dropdown-header" ).selectmenu({
      open: function( event, ui ) {
      },
      close: function(event, ui){
      },
      create: function(event, ui){
      },
      change: function(event, d){
      	indicator = d.item.value;
      	update(data,indicator,y)
		BuildMap(indicator,topo,fipsIndex);
		
		$('.switch.dots.second-in').removeClass("active");
		$("div[name=" + indicator + "]").addClass("active")
		$('#dropdown-header2').val(indicator);
		$("#dropdown-header2").selectmenu("refresh");
      }
     });

    $( "#dropdown-header2" ).selectmenu({
      open: function( event, ui ) {
      },
      close: function(event, ui){
      },
      create: function(event, ui){
      },
      change: function(event, d){
      	indicator = d.item.value;
      	update(data,indicator,y)
		BuildMap(indicator,topo,fipsIndex);
		
		$('.switch.dots.second-in').removeClass("active");
		$("div[name=" + indicator + "]").addClass("active")
		$('#dropdown-header').val(indicator);
		$("#dropdown-header").selectmenu("refresh");
      }
     });

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
	      $("#tip-inner").addClass("active");  
	      isOpened = true;
	      TipPopulate(suggestion,"auto")
	      g.selectAll(".county").classed("active",false).attr("r",bubbleRadius)
	      g.select(".fips" + suggestion.fips5).classed("active",true).attr("r",(bubbleRadius*2)).moveToFront()


	      // CAll function that highlights selected line
	      // Highlight( suggestion.value )
	    }
	  } );

	// event for clicking on buttons to change data
	$('.switch.dots.second-in').on('click',function(){	
		var oldHeight = $('#span2').position().top;			
		$('.switch.dots.second-in').removeClass("active");
		// indicator = $(this)["0"].attributes[2].nodeValue;
		indicator = $(this).attr("name");
		update(data,indicator,y)
		BuildMap(indicator,topo,fipsIndex);

		
		if ($(this).hasClass("lower")) {
			var newHeight = $('#span2').position().top;
			var scroll = $(window).scrollTop();
			$('html, body').animate({scrollTop: newHeight - (oldHeight-scroll) +'px'}, 800);	
		}

		$(this).addClass("active");
		$("div[name=" + indicator + "]").addClass("active")
		$('#dropdown-header').val(indicator);
		$("#dropdown-header").selectmenu("refresh");
		$('#dropdown-header2').val(indicator);
		$("#dropdown-header2").selectmenu("refresh");
	})

	$('#info').click(function(e){  
    	e.stopPropagation();
		$(this).addClass("active");
	})

	$('#info-ex').click(function(e){  
    	e.stopPropagation();
		$("#info").removeClass("active");
	})	

	$('#tool-ex').click(function(e){  
    	e.stopPropagation();
	    $("#tooltip").removeClass("active");  
	    $("#tip-inner").removeClass("active");  
    	isOpened = false;
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
		LineTextLeft = -51,
		margin = {top: 60, right: 10, bottom: 10, left: 100}

	// // width based parameters
	// if (width > breakpoint) {
	// 	var margin = {top: 60, right: 10, bottom: 10, left: 100}
	// } else {
	// 	// Smaller viewports
	// 	var margin = {top: 20, right: 10, bottom: 10, left: 10}
	// }	

	var colorScale = d3.scaleOrdinal()
		.range(["#848081","#d5d5d4","#332d2f","#5c5859","#0096d2","#a2d4ec","#0a4c6a","#12719e","#fdbf11","#fce39e","#843215","#e88e2d"]);		

  	//////// mess with the data
	var y = {}

  	morphData(data,y,false)

	var chartHeight = 200 * (bubbleRadius*2);
	var svg = d3.select("#chart").append("svg")
	  .attr("width", width)
	  .attr("height", chartHeight + margin.top + margin.bottom);

  	// declare main g and stuff
  	var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	g.append("rect")
  		.attr("class","wrapRect")

  	// map gs and svgs
	var svg2 = d3.select("#map").append("svg")	  
	  .attr("height", 200);
  	
  	var g2 = svg2.append("g").attr("transform", "translate(0,0)");

	var projection = d3.geoAlbers() // updated for d3 v4
	    .scale(400)
	    .translate([400 / 2, 200 / 2]);

	// var projection = d3.geoAlbersUsa();
	var path = d3.geoPath()
	    .projection(projection);

	$(window).resize(function() { 
		update(data,indicator,y)
	});





  function update(data,indicator,y) {

  	width = parseInt(d3.select("#chart").style("width"));

	svg.attr("width", width)

	g.select(".wrapRect").transition().duration(1000)
		.attr("width",0)
		.attr("fill-opacity",0)

  	// change the details info
  	$("#details").html(indicatorKey[indicator].details)

  	// update the ranking tables at bottom
  	$(".rank-block-item").remove()
	buildRankTables(ranks,indicator)

  	var t = d3.transition()
      .duration(1500);

	// Index of county bubbles over the max height
    var overIndex = -1;
    // reset height and redraw based on width?
    
	
	var chartHeight = y[indicator].numBins*(bnMult),
		yLineBottom = chartHeight - 130;

	svg.attr("height",chartHeight+margin.top+margin.bottom)

	//remove existing yGrid lines	
	g.selectAll(".yGrid").remove();
	g.selectAll(".yNum").remove();
	g.selectAll(".xNum").remove();
	g.selectAll(".yLine1").remove();
	g.selectAll(".yLine2").remove();
	g.selectAll(".yLineText").remove();

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
	for (var i = 0; i <= numXticks; i++) {
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
		.attr("class","yLine2 wing")
		.attr("x1",yLineX)
		.attr("x2",yLineX + 6)
		.attr("y1",yLineBottom)
		.attr("y2",yLineBottom - 5)		

	g.append("line")
		.attr("class","yLine2 wing")
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

	var overflows = [];


		// EXIT old elements not present in new data.
	counties.exit()	  
		.transition(t)
		  .style("fill-opacity", 1e-6)
		  .remove();

	  // update
  	counties.style("fill-opacity", 1)
    	.transition(t)
			.attr("cx", function (d) { 
				if (isNaN(d[indicator + "Y"])) {
					overIndex += 1;
					return overIndex*bnMult;
				}
				else {

					// this function figures out which rows have too many items per line
					if (d[indicator + "Index"]*bnMult > (width-margin.left)) {
						
						var thisRowOverIcon = false;

						for (var i = 0; i < overflows.length; i++) {
							if (overflows[i] === d[indicator + "Y"]) {
								thisRowOverIcon = true;
							}
						}
						if (thisRowOverIcon === false) {
							overflows.push(d[indicator + "Y"])
						}

					}
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
			.style("fill", function(d) {
				if (indicator === "z_GlobalCapacity" || indicator === "z_Business") {						
					return colorList(+d[indicator],6)
				} else {
					return colorList(+d[indicator],5)
				}
			})		

	  // enter + update
	  counties.enter().append("circle")
      	.attr("class", function(d){
      		return "county fips" + d.fips5;
      	})
			.attr("cx", function (d) { 
				if (isNaN(d[indicator + "Y"])) {
					overIndex += 1;
					return overIndex*bnMult;
				}
				else {

					// this function figures out which rows have too many items per line.
					if (d[indicator + "Index"]*bnMult > (width-margin.left)) {												
						var thisRowOverIcon = false;						
						for (var i = 0; i < overflows.length; i++) {
							if (overflows[i] === d[indicator + "Y"]) {
								thisRowOverIcon = true;
							}
						}
						if (thisRowOverIcon === false) {
							overflows.push(d[indicator + "Y"])
						}

					}

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
				if (indicator === "z_GlobalCapacity" || indicator === "z_Business") {						
					return colorList(+d[indicator],6)
				} else {
					return colorList(+d[indicator],5)
				}
			})
			.style("fill-opacity", 1e-6)
			.on("mouseover",function(d,i){				
				d3.selectAll("circle.hover")
					.attr("r",bubbleRadius)
					.classed("hover",false)

				d3.select(this)
					.attr("r",2*bubbleRadius)
					.classed("hover",true)		
				TipPopulate(d,"mouse")

			})
			.on("mouseout",function(d){
				d3.select(this)
					.attr("r",function(){
						if (d3.select(this).classed("active")) {
							return bubbleRadius*2;
						}
						else {
							return bubbleRadius;
						}
					})
					.classed("hover",false)
				// d3.select("#tooltip").classed("active",false)			
			})
			.on("click",function(d,i){
				d3.selectAll("circle.active")
					.attr("r",bubbleRadius)
					.classed("active",false)

				d3.select(this)
					.attr("r",2*bubbleRadius)
					.moveToFront();

    			$("#tip-inner").addClass("active");  
    			isOpened = true;
    			TipPopulate(d,"click")
			})
			.transition(t)
				.style("fill-opacity", 1);
	
	// very briddle fix to the chrome bug
	if (StartIndex === 0) {
		$('html, body').animate({scrollTop: 10 +'px'}, 800);		
		StartIndex +=1;
	}
	

		// BUILD THE OVERFLOW BUTTONS
	g.selectAll(".overflowButton").remove();				

	var overflowButton = g.selectAll(".overflowButton")		
		.data(overflows)

// Have to add an "on click, wrap the thang"
	var overflow2 = overflowButton.enter().append("foreignObject")
      	.attr("class", "overflowButton")
      	.attr("width", 30)
    	.attr("height", 30)
    	.attr("x",-40)    	
    	.attr("y",function(d){    		
    		return y[indicator](d) - 15;
    	})
    	
    	overflow2.append("xhtml:div")
    		.attr("class","wrapperButton")
    		// .html("<img src='img/wrap2.png'>")
    		.on("mouseover",function(d){
    			d3.select(this.parentNode).moveToFront();
			})
			.on("click",function(d){
				if (d3.select(this.parentNode).classed("wrapped") != true) {
					// first if there are any unwraps open, run the wrap function					
					if (d3.selectAll("foreignObject.wrapped")._groups["0"].length) {
						wrapIt(d,"open",true)
					}	else {
						wrapIt(d,"open",false)
					}					
					d3.selectAll("foreignObject.wrapped").classed("wrapped",false)
					d3.select(this.parentNode).classed("wrapped",true)
				} else {
					wrapIt(d,"close",false)
					d3.select(this.parentNode).classed("wrapped",false)
				}
			})

			//sort the display of the overflow buttons
			g.selectAll(".overflowButton").sort(function(a,b){			
				return b-a;
			})			
  }

  // starting indicator?
  indicator = "z_Housing"
  update(data,indicator,y);
  BuildMap(indicator,topo,fipsIndex);

  function wrapIt(d,open,otherOpen) {

  	var lessthan = [];
  	var equalto = [];

  	// figure out what's at or below the clicked wrapper
  	for (var i = 0; i < data.length; i++) {
  		if (data[i][indicator + "Y"] === d) {
  			equalto.push(data[i]);
  		}
  		else if (data[i][indicator + "Y"] < d) {
  			lessthan.push(data[i]);
  		}
  	}

  	// figure out how many lines to add as a result  	  
  	var extraLines = Math.ceil(equalto.length*bnMult / (width-margin.left)) - 1;
  	var dotsPerRow = Math.floor((width-margin.left)/bnMult); //make rounder number?  	

  	// calculate the extra space
  	var extraForExpandTop = 20;
  	var extraForExpandBottom = 20;
  	var addAmount = (extraLines * bnMult) + extraForExpandTop + extraForExpandBottom;
  	var lowNum = d;

	// move the corresponding y axis items down and
	// move down icon for current wrap, but not as much as the ones above. 
  	// and replace the icon
	

	if (otherOpen === true) {
		moveAxisSpecial(addAmount,lowNum,open,otherOpen);
	} else {
		moveAxisDown(addAmount,lowNum,open,otherOpen);		
	}

  	//highlight the area?	

  	if (open === "open" && otherOpen === false) {

  		g.select(".wrapRect").transition().duration(1000)
  			.attr("x",-45)
  			.attr("y",y[indicator](lowNum)+extraForExpandTop-10)
  			.attr("height",bnMult + extraLines*bnMult+10)
  			.attr("width",width-margin.left+45)
  			.attr("fill-opacity",1)


	  	// move down LOWER dots and wrap the clicked layer dots
	  	g.selectAll("circle.county")
	  		.classed("wrapped",function(d){
	  			var numY = +d3.select(this).attr("cy");
	  			if ( numY >= y[indicator](lowNum)) {
	  				return true
	  			} else {
	  				return false
	  			}
	  		})
	  		.transition().duration(1000)
			.attr("cy",function(d){
				var numY = +d3.select(this).attr("cy");
				var numX = +d3.select(this).attr("cx");

				if ( numY > y[indicator](lowNum)) {
					// dots below the clicked wrapper
					return numY + addAmount;				
				} else if (numY === y[indicator](lowNum)) {
					// dots at the clicked wrapper
					var level = Math.floor((numX/bnMult)/dotsPerRow);
					return numY + (level*bnMult) + extraForExpandTop;
				} else {
					return numY;
				}
			})
			.attr("cx",function(d,i){
				var numY = +d3.select(this).attr("cy");
				var numX = +d3.select(this).attr("cx");

				// anything beyond the fold, move down to under the long line of dots
				// if (numY > y[indicator](lowNum) && numY <= (y[indicator](lowNum)+addAmount)) {				
				if (numY === y[indicator](lowNum)) {
					var index = numX/bnMult;
					if ((numX/bnMult) >= dotsPerRow) {
						// wrap
						
						var level = Math.floor(index/dotsPerRow);
						var newX = (index - (level*dotsPerRow))*bnMult + (bnMult*1);
						return newX;
					} else {
						return numX;
					}				
				} else {
					return numX;
				}
			})


  	} else if (open === "open" && otherOpen === true) {

  		g.select(".wrapRect").transition().duration(1000)
  			.attr("x",-45)
  			.attr("y",y[indicator](lowNum)+extraForExpandTop-10)
  			.attr("height",bnMult + extraLines*bnMult+10)
  			.attr("width",width-margin.left+45)
  			.attr("fill-opacity",1)


  		g.selectAll("circle.county")
	  		.filter(function(d){ 
	  			return +d3.select(this).attr("cy") >= y[indicator](lowNum)
		  	}).classed("curWrap",true)

  		g.selectAll("circle.county.wrapped,circle.curWrap")
  		.classed("wrapped",false)  		
  		.classed("curWrap",false)
  		.transition().duration(1000)
	  		.attr("cx", function (d) { 
				return d[indicator + "Index"]*bnMult;	
			})
			.attr("cy", function (d) {
				return y[indicator](d[indicator + "Y"])	
			}).on("end",function(){
				d3.select(this).classed("wrapped",true).transition().duration(1000)
				.attr("cy",function(d){
					var numY = +d3.select(this).attr("cy");
					var numX = +d3.select(this).attr("cx");

					if ( numY > y[indicator](lowNum)) {
						// dots below the clicked wrapper
						return numY + addAmount;				
					} else if (numY === y[indicator](lowNum)) {
						// dots at the clicked wrapper
						var level = Math.floor((numX/bnMult)/dotsPerRow);
						return numY + (level*bnMult) + extraForExpandTop;
					} else {
						return numY;
					}
				})
				.attr("cx",function(d,i){
					var numY = +d3.select(this).attr("cy");
					var numX = +d3.select(this).attr("cx");

					// anything beyond the fold, move down to under the long line of dots
					// if (numY > y[indicator](lowNum) && numY <= (y[indicator](lowNum)+addAmount)) {				
					if (numY === y[indicator](lowNum)) {
						var index = numX/bnMult;
						if ((numX/bnMult) >= dotsPerRow) {
							// wrap
							
							var level = Math.floor(index/dotsPerRow);
							var newX = (index - (level*dotsPerRow))*bnMult + (bnMult*1);
							return newX;
						} else {
							return numX;
						}				
					} else {
						return numX;
					}
				})					
			})

  	} else {
  		// collapse  	

  		g.select(".wrapRect").transition().duration(1000)
  			.attr("width",0)
  			.attr("fill-opacity",0)


	  	g.selectAll("circle.county.wrapped").classed("wrapped",false).transition().duration(1000)
	  		.attr("cx", function (d) { 
				return d[indicator + "Index"]*bnMult;	
			})
			.attr("cy", function (d) {
				return y[indicator](d[indicator + "Y"])	
			})
  	}
  }
 

  function moveAxisSpecial(addAmount,lowNum,open,otherOpen) {
  	var chartHeight = y[indicator].numBins*(bnMult),
		yLineBottom = chartHeight - 130;

	var oldY = svg.attr("height");
	svg.attr("height",chartHeight+margin.top+margin.bottom+addAmount)

	var newChangeAmount = svg.attr("height") - oldY;

	g.select(".yLineText.end").attr("x",-chartHeight + 10 - addAmount)

	g.selectAll(".yLine2")
		.attr("y2", yLineBottom + addAmount)

	g.selectAll(".yLine2.wing")
		.attr("y1",yLineBottom + addAmount)
		.attr("y2",yLineBottom - 5 + addAmount)

	g.selectAll(".overflowButton").transition().duration(1000)
		.attr("y",function(d){
			var numY = +y[indicator](d)-15
			if ( numY > (y[indicator](lowNum)-15)) {
				// move the lower wrap markers down fully
				return numY + addAmount;
			} else if (numY === (y[indicator](lowNum)-15)){
				// move the current/clicked wrap marker down half way
				return numY + (addAmount/2);
			} else {
				// otherwise do nothing
				return numY;			
			}
		})

	// numbers on axis
	g.selectAll(".yNum")
		.attr("y",function(d){
			var numY = +d3.select(this).attr("y")
			if ( d3.select(this).attr("y") > y[indicator](lowNum)) {
				return numY + newChangeAmount;
			} else {
				return numY;
			}
		})
	// gridlines		
	g.selectAll(".yGrid")
		.attr("y1",function(d){
			var numY = +d3.select(this).attr("y1")
			if ( d3.select(this).attr("y1") > y[indicator](lowNum)) {
				return numY + newChangeAmount;
			} else {
				return numY;
			}
		})
		.attr("y2",function(d){
			var numY = +d3.select(this).attr("y2")
			if ( d3.select(this).attr("y2") > y[indicator](lowNum)) {
				return numY + newChangeAmount;
			} else {
				return numY;
			}
		})

	// wrap markers



  }

  function moveAxisDown(addAmount,lowNum,open,otherOpen) {

  	if (open != "open") {
  		addAmount = -addAmount;
  	}

	// make svg bigger?
	svg.attr("height",+svg.attr("height")+addAmount)
	// lower y label
	var textX = g.select(".yLineText.end").attr("x")	
	g.select(".yLineText.end").attr("x",textX - addAmount)
	// Y line	
	g.selectAll(".yLine2")
		.attr("y2",function(d){
			var lineY = d3.select(this).attr("y2")
			return +lineY + addAmount;
		})
	g.selectAll(".yLine2.wing")
		.attr("y1",function(d){
			var lineY = d3.select(this).attr("y1")
			return +lineY + addAmount;
		})
	// numbers on axis
	g.selectAll(".yNum")
		.attr("y",function(d){
			var numY = +d3.select(this).attr("y")
			if ( d3.select(this).attr("y") > y[indicator](lowNum)) {
				return numY + addAmount;
			} else {
				return numY;
			}
		})

	// gridlines		
	g.selectAll(".yGrid")
		.attr("y1",function(d){
			var numY = +d3.select(this).attr("y1")
			if ( d3.select(this).attr("y1") > y[indicator](lowNum)) {
				return numY + addAmount;
			} else {
				return numY;
			}
		})
		.attr("y2",function(d){
			var numY = +d3.select(this).attr("y2")
			if ( d3.select(this).attr("y2") > y[indicator](lowNum)) {
				return numY + addAmount;
			} else {
				return numY;
			}
		})

	// wrap markers
	if (open === "open") {
		g.selectAll(".overflowButton").transition().duration(1000)
			.attr("y",function(d){
				var numY = +d3.select(this).attr("y")					
				if ( numY > (y[indicator](lowNum)-15)) {
					// move the lower wrap markers down fully
					return numY + addAmount;
				} else if (numY === (y[indicator](lowNum)-15)){
					// move the current/clicked wrap marker down half way
					return numY + (addAmount/2);
				} else {
					// otherwise do nothing
					return numY;			
				}
			})
    	} else {
    		g.selectAll(".overflowButton").transition().duration(1000)
				.attr("y",function(d){
					var numY = +d3.select(this).attr("y")	
					if (numY < y[indicator](lowNum)+ -15 + -(addAmount/2)) {
						return numY
					} else if (numY === y[indicator](lowNum)+ -15 + -(addAmount/2)) {
						return numY+(addAmount/2)	
					} else {
						return numY+addAmount
					}
					
				})
    	}
	
  }

  function TipPopulate(data,type) {
  	// if hidden, show tip  	
  	if (isOpened === false || type === "click" || type === "auto") {
  		if (!$("#tooltip").hasClass("active")) {
	  		$("#tooltip").addClass("active")
	  	}

	  	width = parseInt(d3.select("#chart").style("width"));

	  	xPos = g.select(".fips" + data.fips5).attr("cx")

	  	if (width > breakpoint) {
	  		if (xPos >(width-500)) {
	  			$("#tooltip").css('left', 0 + "px")
	  			$("#tooltip").css('right',"unset")
	  		} else {
	  			$("#tooltip").css('right', 0 + "px")
	  			$("#tooltip").css('left', "unset")
	  		}
		  	if (data[indicator] > 2) {  		
		  		var tipHead = g.select(".fips" + data.fips5).attr("cy");
		  	} else if (data[indicator] > 0) {
		  		var tipHead = g.select(".fips" + data.fips5).attr("cy") - ($("#tooltip").outerHeight() / 2)
		  	} else {
		  		var tipHead = g.select(".fips" + data.fips5).attr("cy") - $("#tooltip").outerHeight()
		  	}
		  	if (true) {}
		}
		else {
			if (type === "click" || type === "auto") {
				var tipHead = 52;
			} else {
				if (data[indicator] > 2 || data[indicator] === "NA") {
					var tipHead = +g.select(".fips" + data.fips5).attr("cy") + 100;
				} else {
					var tipHead = g.select(".fips" + data.fips5).attr("cy") - $("#tooltip").outerHeight()	
				}		  		
			}
			
		}

	  	$("#tooltip").css('top',tipHead + "px")

	  	// $("#chart").

	  	// SCROLL THE PAGE HERE
	  	if (type === "auto") {
	  		var newHeight = $('html').scrollTop() + +tipHead + 100;
	  		$('html, body').animate({scrollTop: newHeight +'px'}, 800);	
	  	}

	  	// update Dom
	  	var title = '<span class="bold">' + data.CountyName + ' County,</span> ' + data.State,
	  	size = findSize(+data.popsize_bin)
	  	population = '<span class="bold">Population:</span> ' + formatComma(data.totalpop) + '</p>',
	  	rankOverall =  '<span class="bold">Rank – '+ indicatorKey[indicator].proper +' overall:</span> ' + data[indicatorKey[indicator].variable + "_rank_overall"] +'</p>',
	  	percOverall =  '<span class="bold">Percentile – '+ indicatorKey[indicator].proper +' overall:</span> ' + data[indicatorKey[indicator].variable + "_ptile_overall"] + suffix(data[indicatorKey[indicator].variable + "_ptile_overall"]) + '</p>',
	  	rankSpecific =  '<span class="bold">Rank – '+ indicatorKey[indicator].proper +' among ' + size.name + '* counties:</span> ' + data[indicatorKey[indicator].variable + "_rank"] +'</p>',
	  	percSpecifc =  '<span class="bold">Percentile – '+ indicatorKey[indicator].proper +' among ' + size.name + '* counties:</span> ' + data[indicatorKey[indicator].variable + "_ptile"] + suffix(data[indicatorKey[indicator].variable + "_ptile"]) +'</p',
	  	sizeDesc = size.desc;

	  	$(".tip-title").html(title)
	  	$("#population").html(population)
	  	$("#rankOverall").html(rankOverall)
	  	$("#percOverall").html(percOverall)
	  	$("#rankSpecific").html(rankSpecific)
	  	$("#percSpecifc").html(percSpecifc)
		$(".tip-note").html(sizeDesc)
		
	  	// update map/zoom the map
	  	if (type === "auto" || type === "click") {
			zoomMap(data,indicator)
	  		g.select(".fips" + data.fips5).classed("active",true)
	  	}
	  	

	  	
  	}
  }

  function BuildMap(category,topo,fipsIndex) {

	// if (svg2.selectAll(".subunit.active")._groups["0"].length) {
	// 	console.log("here")
	// }
	var ffff = svg2.select(".subunit.active")
	var num;


	if (!ffff.empty()) {		
		num = ffff.data()[0].id;
	}

  	svg2.selectAll(".subunit").remove();
	svg2.selectAll("path").remove();

    g2.append("path")
		.attr("class","pathDaddy")
    	.datum(topojson.feature(topo, topo.objects.counties))
			.attr("d", path);

	g2.selectAll(".subunit")
	  .data(topojson.feature(topo, topo.objects.counties).features)
	.enter().append("path")
	  .attr("class", function(d) {
	  	return "subunit fips" + d.id})
	  .attr("d", path)
	  .attr("fill", function(d){	
	  	var workinglate = fipsIndex.get(d.id);	
		if (workinglate != undefined) {
			if (category === "z_GlobalCapacity" || category === "z_Business") {						
				return colorList(+workinglate[category],6)
			} else {
				return colorList(+workinglate[category],5)
			}
		} else {
			return "#d2d2d2"
		}	
	  })

	g2.append("path")
	    .datum(topojson.mesh(topo, topo.objects.counties, function(a, b) { 
	    	return a.id.toString().substr(0, 2) !== b.id.toString().substr(0, 2) }))
	    .attr("d", path)
	    .attr("class", "subunit-boundary");	  

	g2.select(".fips" + num	).classed("active",true).moveToFront();

  }

  	function zoomMap(suggestion,category) {		
  		var height = 200;
  		
	  	width = parseInt(d3.select("#chart").style("width"));
 		

  		if (width > breakpoint) {
  			svg2.attr("width",400)
  			var MapWidth = 400;	
  		} else  {
  			svg2.attr("width",width)
  			var MapWidth = width;
  		}



		county = topojson.feature(topo, topo.objects.counties).features.filter(function(d) { return +d.id === +suggestion.fips5; })[0];

		projection
	      .scale(1)
	      .translate([0, 0]);

		var b = path.bounds(county),
			s = .25 / Math.max((b[1][0] - b[0][0]) / MapWidth, (b[1][1] - b[0][1]) / height),
			t = [(MapWidth - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

		 projection
			.scale(s)
			.translate(t);

	
		// look for the fips codes with a leading 0 and remove
		var workinglate = suggestion.fips5; 

		// move the map, don't just redraw it entirely!
		// something like this: https://bl.ocks.org/iamkevinv/0a24e9126cd2fa6b283c6f2d774b69a2
		g2.selectAll(".subunit").classed("active",false)
		g2.select(".fips" + workinglate).moveToFront();
		g2.select(".fips" + workinglate	).classed("active",true)
		g2.select(".pathDaddy").attr("d", path);
		g2.selectAll(".subunit").attr("d", path);
		g2.selectAll(".subunit-boundary").attr("d",path)
	}

	function ranker(ranks,data) {
		// get top ten for each group
		// get bottom ten for each group
		var small = data.filter(function(d){return d.popsize_bin === "2"})
		var midsize = data.filter(function(d){return d.popsize_bin === "3"})
		var large = data.filter(function(d){return d.popsize_bin === "5"})
		

		for (var item in ranks) {			
			small.sort(function(a,b){				
				return +a[indicatorKey[item].variable + "_rank"] - +b[indicatorKey[item].variable + "_rank"]
			})			
			midsize.sort(function(a,b){				
				return +a[indicatorKey[item].variable + "_rank"] - +b[indicatorKey[item].variable + "_rank"]
			})		
			large.sort(function(a,b){
				if (item === "z_Business") {
					if (a.value === "Puerto Rico County, Puerto Rico") {
						return 1000 - +b[indicatorKey[item].variable + "_rank"]	
					} else if (b.value === "Puerto Rico County, Puerto Rico") {
						return +a[indicatorKey[item].variable + "_rank"] - 1000
					} else {
						return +a[indicatorKey[item].variable + "_rank"] - +b[indicatorKey[item].variable + "_rank"]	
					}					
				} else if (item != "z_Business") {
					return +a[indicatorKey[item].variable + "_rank"] - +b[indicatorKey[item].variable + "_rank"]	
				}
			})				
			for (var i = 0; i < 10; i++) {
				ranks[item].small.top.push(small[i])
				ranks[item].midsize.top.push(midsize[i])
				ranks[item].large.top.push(large[i])
			}
			for (var i = small.length - 1; i >= small.length - 10; i--) {
				ranks[item].small.bottom.push(small[i])
			}
			for (var i = midsize.length - 1; i >= midsize.length - 10; i--) {
				ranks[item].midsize.bottom.push(midsize[i])
			}
			for (var i = large.length - 1; i >= large.length - 10; i--) {
				ranks[item].large.bottom.push(large[i])
			}

		}		
	} 

	function buildRankTables(ranks, indicator) {
		for (var sizes in ranks[indicator]) {

			for (var i = 0; i < ranks[indicator][sizes].top.length; i++) {
				var rrrank = ranks[indicator][sizes].top[i][indicatorKey[indicator].variable + "_rank"];
				var nnname = ranks[indicator][sizes].top[i]["value"];
				var rankAdd =  '<div class="rank-block-item"><div class="rank-block-item-rank">#' + rrrank +'</div><div class="rank-block-item-name">' + nnname + '</div></div>'
				$("#ranktop" + sizes).append(rankAdd)
			}

			for (var i = 0; i < ranks[indicator][sizes].bottom.length; i++) {
				var rrrank = ranks[indicator][sizes].bottom[i][indicatorKey[indicator].variable + "_rank"];
				var nnname = ranks[indicator][sizes].bottom[i]["value"];
				var rankAdd =  '<div class="rank-block-item"><div class="rank-block-item-rank">#' + rrrank +'</div><div class="rank-block-item-name">' + nnname + '</div></div>'
				$("#rankbottom" + sizes).append(rankAdd)
			}
		}			
		
	}

	function morphData(data,y,wrapped) {
		// create d3 key here. 
		var map = d3.map(data, function(d) { return d.id; });

		for (var k = 0; k < indicators.length; k++) {	
			// var extent = d3.extent(data, function(d) { return +d[indicators[k]]});
			var min = Math.floor(d3.min(data, function(d) { return +d[indicators[k]]}));
			// var max = Math.ceil(d3.max(data, function(d) { return +d[indicators[k]]}));
			var max = 3;		


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
			
			var maxDots = Math.floor((width-margin.left)/bnMult);

			for (var i = 0; i < bins.length; i++) {
				// // bins[i].sort(function(a,b){return b[indicators[k]] - a[indicators[k]]  })
				// // console.log((bins[i].length)*bubbleRadius*2)
				// // console.log(bins[i].length*bnMult)
				// // if too long, create array at width x dots
				// if (bins[i].length > maxDots) {
				// 	// console.log(bins[i])
				// 	console.log("hello")
				// }
				
				for (var j = 0; j < bins[i].length; j++) {
					var now = map.get(bins[i][j].id);
					now[indicators[k] + "Index"] = j;
					now[indicators[k] + "Y"] = (bins[i].x1 + bins[i].x0)/2;
					// now[indicators[k] + "Index"] = j;
					// now[indicators[k] + "Y"] = (bins[i].x1 + bins[i].x0)/2;
				}
			}

		}
	  }

}
