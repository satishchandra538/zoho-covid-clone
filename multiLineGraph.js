const multiLineGraph = (countries, days, numberOfCountriesInLineChart) => {
    var LineGraphParent = document.getElementById('worldMultilineChart').parentElement;
    const margin = { left: 60, top: 30, right: 45, bottom: 20 };
    countries.forEach(country => {
        const option = document.createElement("option");
        option.value = country[0];
        option.innerHTML = country[0];
        countrySelection.appendChild(option);
    })
    const svg = d3.select('#worldMultilineChart')
        .attr('width', LineGraphParent.offsetWidth)
        .attr('height', LineGraphParent.offsetWidth * .4 + 20)

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

    //sorting country according to confirmed cases
    const sortBy = document.getElementById("sortBy");

    const fromDayInRange = document.getElementById('fromDayInRange');
    fromDayInRange.max = days;
    document.getElementById('fromDay').innerHTML = fromDayInRange.value;
    document.getElementById('toDay').innerHTML = days;

    var fromDay = fromDayInRange.value;
    countries.sort((a, b) => {
        return b[1][fromDay][sortBy.value] - a[1][fromDay][sortBy.value];
    })

    //Graph from day X to till date
    const newData = [];
    countries.forEach(country => {
        let name = country[0];
        let data = [];
        for (let i = fromDay; i < days; i++) {
            data.push(country[1][i]);
        }
        let set = [];
        set.push(name);
        set.push(data);
        newData.push(set);
    })

    var topX = [];
    var numberOfCountriesInLineChart = document.getElementById('numberOfCountriesInLineChart').value;
    for (let i = 0; i < numberOfCountriesInLineChart; i++) {
        topX.push(newData[i]);
    }

    $("#countrySelection").select2({
        placeholder: "Select a country",
        allowClear: true
    });
    const select2List = document.getElementById("select2-countrySelection-container");
    if (select2List.childElementCount) {
        topX = [];
        //select2List.children.style.color = 'black';
        const select2Values = select2List.innerText.split("×");
        select2Values.shift();
        for(let i=0;i<select2Values.length;i++){
            newData.forEach(country=>{
                if(country[0]===select2Values[i]){
                    topX.push(country);
                }
            })
        }
        document.getElementById("controlDisplay").style.display = "none";
    }
    else {
        document.getElementById("controlDisplay").style.display = "inline";
    }
    var maxYValue = 0;
    topX.forEach(country => {
        country[1].forEach(day => {
            maxYValue = maxYValue < day.confirmed ? day.confirmed : maxYValue;
        })
    })
    //console.log("topX", topX, "newdata", newData)
    //console.log(maxYValue, topX)

    const yScale = d3.scaleLinear()
        .domain([maxYValue, 0])
        .range([0, LineGraphParent.offsetWidth * .4 - 30])
        .nice()
    const yAxis = d3.axisLeft(yScale)
        .tickSize(-LineGraphParent.offsetWidth + 80);
    svg.selectAll('.yaxis').remove();
    g.append('g')
        .call(yAxis)
        .attr('class', 'yaxis')
        .attr('transform', `translate(${0},${-margin.bottom})`)
    const lineColor = d3.scaleOrdinal().range(d3.schemeCategory10);
    const line = d3.line()
        .curve(d3.curveMonotoneX)
        .x(d => xScale(d.date))
        .y(d => yScale(d.confirmed));

    const xScale = d3.scaleTime()
        .domain(d3.extent(newData[0][1], d => d.date))
        .range([0, LineGraphParent.offsetWidth - 80])

    const xTicks = 10;
    const xAxis = d3.axisBottom(xScale)
        .ticks(xTicks)
        .tickSize(-LineGraphParent.offsetHeight + 102);
    svg.selectAll('.xaxis').remove();
    g.append('g')
        .call(xAxis)
        .attr('class', 'xaxis')
        .attr('transform', `translate(${0},${LineGraphParent.offsetWidth * .4 - margin.bottom - 30})`);

    svg.selectAll(".country").remove();
    var country = g.selectAll(".country")
        .data(topX)
        .enter()
        .append("g")
        .attr("class", d => `country ${d[0]}`)
        .attr('transform', `translate(${-margin.left + 61},${-margin.bottom})`);

    country.append('path')
        .attr('fill', 'none')
        .style("stroke", d => lineColor(d[0]))
        .attr("stroke-width", 1.5)
        .attr("d", d => line(d[1]))

    country.append('text')
        .style("fill", d => lineColor(d[0]))
        .text(d => d[0])
        .style("font-weight", 600)
        .attr('x', d => xScale(d[1][days - 1 - fromDay].date) - 80)
        .attr('y', d => yScale(d[1][days - 1 - fromDay].confirmed) - 2)
        .attr('class', 'line-graph-country-legend')

    svg.selectAll('.legend-circle').remove();
    country.selectAll('.legend-circles-path')
        .data(topX)
        .enter()
        .append('g')
        .attr('class', 'legend-circle')
        .attr('fill', d => lineColor(d[0]))
        .selectAll('circle')
        .data(d => d[1])
        .enter()
        .append('circle')
        .attr("r", 1.5)
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale(d.confirmed))
        .on('mouseover', function (d) {
            div.style("display", "block")
            div.transition()
                .duration(200)
                .style("opacity", 0.8);
            div.html(
                `<span style="font-size:16px"><b>Confirmed</b>: ${d.confirmed}</span>
                <br/>
                <span style="color:black"><b>Deaths</b>: ${d.deaths}</span>
                <br/>
                <span style="color:black"><b>Date</b>: ${(d.date).toString().substring(0, 16)}</span>`
            )
                .style('left', d3.event.pageX + 10 + 'px')
                .style('top', d3.event.pageY - 28 + 'px');
            this.attributes[0].value = 3;
            // console.log(this)
        })
        .on("mouseout", function (d) { div.style("display", "none"); this.attributes[0].value = 1.5; })

}
window.multiLineGraph = multiLineGraph;
module.exports = multiLineGraph;