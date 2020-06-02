const donutChart = (totalActive, totalDeath, totalRecovered) => {
    var pieCharParent = document.getElementById('worldActivePieChart').parentElement;
    var pieChartWidth = pieCharParent.offsetWidth * 0.6;
    var radius = pieChartWidth / 2;
    const donutData = [{ label: 'totalRecovered', value: totalRecovered },
    { label: 'totalActive', value: totalActive },
    { label: 'totalDeath', value: totalDeath }];

    var svg = d3.select("#worldActivePieChart")
        .attr("width", pieCharParent.offsetWidth)
        .attr("height", pieCharParent.offsetWidth / 1.2)
        .append('g')
        .attr('transform', `translate(${pieChartWidth / 1.2},${pieChartWidth / 1.2})`)

    var color = d3.scaleOrdinal()
        .domain(donutData.map(d => d.label))
        .range(d3.schemeDark2);

    var pie = d3.pie()
        .value(function (d) { return d.value.value; })
    var data_ready = pie(d3.entries(donutData))

    var arc = d3.arc()
        .innerRadius(radius * 0.5)
        .outerRadius(radius * 0.8)

    // Another arc that won't be drawn. Just for labels positioning
    var outerArc = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9)

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg
        .selectAll('allSlices')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', function (d) { return (color(d.data.key)) })
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)

    // Add the polylines between chart and labels:
    svg
        .selectAll('allPolylines')
        .data(data_ready)
        .enter()
        .append('polyline')
        .attr("stroke", "black")
        .style("fill", "none")
        .attr("stroke-width", 1)
        .attr('points', function (d) {
            var posA = arc.centroid(d) // line insertion in the slice
            var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
            var posC = outerArc.centroid(d); // Label position = almost the same as posB
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
            posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
            return [posA, posB, posC]
        })

    // Add the polylines between chart and labels:
    svg
        .selectAll('allLabels')
        .data(data_ready)
        .enter()
        .append('text')
        .text(function (d) { return d.data.value.label })
        .attr('transform', function (d) {
            var pos = outerArc.centroid(d);
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
            return 'translate(' + pos + ')';
        })
        .style('text-anchor', function (d) {
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            return (midangle < Math.PI ? 'start' : 'end')
        })
}
window.donutChart = donutChart;
module.exports = donutChart;