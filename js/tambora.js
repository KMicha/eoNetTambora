// tmb-events
var tmbBase   = "https://tambora-test.ub.uni-freiburg.de/tambora-dev/index.php/";
var tmbServer = tmbBase + "grouping/event/eonet";
var tmbViewEvent = tmbBase + "grouping/event/show?event_id="; 
var tmbLimit  = 120;
var tmbDistance = 2000; // km	
var tmbGrouping = 6;
var tmbData = null;

$(document).ready(function () {
  initTamboraCharts();
});	

// http://tambora-test.ub.uni-freiburg.de/tambora-dev/index.php/grouping/event/eonet?s[lng]=20&s[lat]=10

function getEoNetData() {
  return eoNetData;
}

function getEoNetDataByKey(key) {
  return eoNetData[key];
}

function loadTmbEvents(longitude, latitude, param, colorParent) {

    $.getJSON( tmbServer + "?" + param, {
        's[lng]': longitude,
        's[lat]': latitude,
	's[mxd]': tmbDistance,
        limit: tmbLimit
        })
    .done(function( data ) {
        tmbData = data;
		$('#tmbCount').html(data.total);
	processTmbEvents(colorParent);
        //redrawTmbEvents();	
        addEventsToGlobe(tmbData.events);	
		updateChartData(tmbData.events);
		
    });
	
}

function processTmbEvents(colorParent) {
  $.each( tmbData.events, function( key, event ) {
    //var category = getCategoryData(event);
    //eoNetData.events[key].type = category.title;
    //eoNetData.events[key].color = category.color;
    tmbData.events[key].from = 'tambora';
    tmbData.events[key].color = colorParent;
    //eoNetData.events[key].param = category.param;
    //eoNetData.events[key].image = category.image;	
    var geometry = getGeometryData(event);	
    if (geometry) {
      tmbData.events[key].latitude = geometry.latAvg;
      tmbData.events[key].longitude = geometry.longAvg;
      tmbData.events[key].timeStart = geometry.timeMin;
      tmbData.events[key].timeEnd = geometry.timeMax;
      tmbData.events[key].days = (geometry.timeMax - geometry.timeMin) / (1000 * 60 * 60 * 24);
      tmbData.events[key].year = geometry.timeMin.getFullYear();
      tmbData.events[key].month = 1 + geometry.timeMin.getMonth();
    }
  });
}

{

var daysChart = null;
var monthChart = null;
var yearChart = null;
var distChart = null;
var tmbEventTable = null;

var chartData = null;

var initTamboraCharts = function() {
	
  daysChart = dc.barChart('#days-chart');
  monthChart = dc.pieChart('#month-chart');
  yearChart = dc.barChart('#year-chart');
  distChart = dc.barChart('#dist-chart');
  tmbEventTable = dc.dataTable('.tmb-data-table');
  // nasdaqCount = dc.dataCount('.dc-data-count');
	
}

var updateChartData = function (events) {
    chartData = []; 
    events.forEach(function (event) {
		var result = {
			id: event.id,
			start: event.timeStart,
			year: event.year,
			days: event.days,
			month: event.month,
			distance: event.distance,
			location: event.location
		};
        chartData.push(result);
    });	
	
    var ndx = crossfilter(chartData);
    var all = ndx.groupAll();	
	
	// Date Dimension
	var dimStart = ndx.dimension(function (d) {
        return d.start;
    });
    // Dimension by month
    var dimMonth = ndx.dimension(function (d) {
        return d.month;
    });	
	var monthGroup = dimMonth.group();
    // Dimension by days
    var dimDays = ndx.dimension(function (d) {
        return Math.round(d.days);
    });	
	var daysGroup = dimDays.group();
    // Dimension by year
    var dimYear = ndx.dimension(function (d) {
        return  Math.round(d.year);
		return 25 * Math.round(d.year / 25);
    });	
    var yearGroup = dimYear.group();	
    // Dimension by distance
    var dimDist = ndx.dimension(function (d) {
		return 20 * Math.round(d.distance / 20);
    });	
    var distGroup = dimDist.group();
	
	
	// MONTH
	monthChart /* dc.pieChart('#quarter-chart', 'chartGroup') */
     .width(180)
     .height(180)
     .radius(80)
     .innerRadius(30)
     .dimension(dimMonth)
     .group(monthGroup);
	
    // DAYS	
    daysChart /* dc.barChart('#volume-month-chart', 'chartGroup') */
        .width(420)
        .height(180)
        .margins({top: 10, right: 50, bottom: 30, left: 40})
        .dimension(dimDays)
        .group(daysGroup)
        .elasticY(true)
        // (_optional_) whether bar should be center to its x value. Not needed for ordinal chart, `default=false`
        .centerBar(true)
        // (_optional_) set gap between bars manually in px, `default=2`
        .gap(1)
        // (_optional_) set filter brush rounding
        .round(dc.round.floor)
        //.alwaysUseRounding(true)
		.elasticX(true)
        .x(d3.scale.log().domain([.5, 500]))
        .renderHorizontalGridLines(true);

    // Customize axes
	daysChart.xAxis().tickFormat(
        function (v) { return Math.round(v); });
    daysChart.yAxis().ticks(5);		
		
	// YEAR
    yearChart /* dc.barChart('#volume-month-chart', 'chartGroup') */
        .width(420)
        .height(180)
        .margins({top: 10, right: 50, bottom: 30, left: 40})
        .dimension(dimYear)
        .group(yearGroup)
        .elasticY(true)
        // (_optional_) whether bar should be center to its x value. Not needed for ordinal chart, `default=false`
        .centerBar(true)
        // (_optional_) set gap between bars manually in px, `default=2`
        .gap(15)
        // (_optional_) set filter brush rounding
        .round(dc.round.floor)
        //.alwaysUseRounding(true)
		.elasticX(true)
        .x(d3.scale.linear().domain([1200, 2200]))
        .renderHorizontalGridLines(true);

    // Customize axes
	yearChart.xAxis().tickFormat(
        function (v) { return 10*Math.round(v/10); });
    yearChart.yAxis().ticks(5);	
    yearChart.xUnits(function(){return 20;});	
		
	// Distance
    distChart /* dc.barChart('#volume-month-chart', 'chartGroup') */
        .width(420)
        .height(180)
        .margins({top: 10, right: 50, bottom: 30, left: 40})
        .dimension(dimDist)
        .group(distGroup)
        .elasticY(true)
        // (_optional_) whether bar should be center to its x value. Not needed for ordinal chart, `default=false`
        .centerBar(true)
        // (_optional_) set gap between bars manually in px, `default=2`
        .gap(1)
        // (_optional_) set filter brush rounding
        .round(dc.round.floor)
        //.alwaysUseRounding(true)
		.elasticX(true)
        //.x(d3.scale.linear().domain([0, 2000]))
		.x(d3.scale.log().domain([.5, 2000]))
        .renderHorizontalGridLines(true);

    // Customize axes
	distChart.xAxis().tickFormat(
        function (v) { return 10*Math.round(v/10); });
    distChart.yAxis().ticks(5);			
		
		
    // TABLE
	var dynatable = $('#tmb-data-table').dynatable({
                features: {
                    pushState: false
                },
                dataset: {
                    records: dimStart.top(Infinity),
                    perPageDefault: 8,
                    perPageOptions: [2, 3, 4, 5, 8, 10, 15, 20, 30, 50, 80, 100]
                },
				writers: {
                  "start": function (record, tr) {
                    return extractMapTime(record.start); },
                  "days": function (record, tr) {
                    return Math.round(record.days ); },					
                  "distance": function (record, tr) {
                    return Math.round(record.distance * 10.0) / 10.0; },
				  "id": function (record, tr) {
                    return "<a href='"+tmbViewEvent+record.id+"'><span class='glyphicon glyphicon-eye-open'></span></a>"; },
                }
            }).data('dynatable');	
		
    function RefreshTable() {
                dc.events.trigger(function () {
                    dynatable.settings.dataset.originalRecords = dimStart.top(Infinity);
                    dynatable.process();
                });
            };	
    for (var i = 0; i < dc.chartRegistry.list().length; i++) {
                var chartI = dc.chartRegistry.list()[i];
                chartI.on("filtered", RefreshTable);
            }
	RefreshTable();
	
	
		
	// Finally render all	
    dc.renderAll();
	dc.redrawAll();
	
}

}