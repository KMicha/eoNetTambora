{

var daysChart = null;
var monthChart = null;
var indexChart = null;
var yearChart = null;
var distChart = null;
var tmbEventTable = null;

var chartData = null;

var initTamboraCharts = function() {
	
  daysChart = dc.barChart('#days-chart');
  monthChart = dc.pieChart('#month-chart');
  indexChart = dc.rowChart('#index-chart');
  yearChart = dc.barChart('#year-chart');
  distChart = dc.barChart('#dist-chart');
  tmbEventTable = dc.dataTable('.tmb-data-table');

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
			location: event.location,
                        index: event.index + ":" + event.value,
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
    // Dimension by index
    var dimIndex = ndx.dimension(function (d) {
        return d.index;
    });	
    var indexGroup = dimIndex.group();
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
	
	
	var quarterWidth = Math.round(0.225*$(".tmbCharts").width());
	var quarterHeight = Math.round((120 + quarterWidth) / 2.0);
	
	// MONTH
     monthChart /* dc.pieChart('#quarter-chart', 'chartGroup') */
     .width(quarterWidth)
     .height(quarterHeight)
     .radius(Math.round(0.4 * quarterWidth))
     .innerRadius(Math.round(0.15 * quarterWidth))
     .dimension(dimMonth)
     .group(monthGroup);

    indexChart /* dc.rowChart('#day-of-week-chart', 'chartGroup') */
        .width(Math.round(0.7 * quarterWidth))
        .height(quarterHeight)
        .margins({top: 20, left: 10, right: 10, bottom: 20})
        .group(indexGroup)
        .dimension(dimIndex)
        //.ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
        .label(function (d) {
            return d.key.split(':')[1];
        })
        .title(function (d) {
            return d.key;
        })
        .elasticX(true)
        .xAxis().ticks(4);
	
	
		
	// YEAR
    yearChart /* dc.barChart('#volume-month-chart', 'chartGroup') */
        .width(2*quarterWidth)
        .height(quarterHeight)
        .margins({top: 10, right: 20, bottom: 30, left: 20})
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
        .width(2*quarterWidth)
        .height(quarterHeight)
        .margins({top: 10, right: 20, bottom: 30, left: 20})
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
	
    // DAYS	
    daysChart /* dc.barChart('#volume-month-chart', 'chartGroup') */
        .width(2*quarterWidth)
        .height(quarterHeight)
        .margins({top: 10, right: 20, bottom: 30, left: 20})
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
