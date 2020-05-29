const countrySelection = document.getElementById("countrySelection");
const totalConfirmedInDoc = document.getElementById("totalConfirmed");
const totalDeathsInDoc = document.getElementById("totalDeaths");
const totalCriticalInDoc = document.getElementById("totalCritical");
const totalRecoveredInDoc = document.getElementById("totalRecovered");
const totalDeathRateInDoc = document.getElementById("deathRate");
const totalRecoveryRateInDoc = document.getElementById("recoveryRate");
const worldTable = document.getElementById("worldTable");

//Tool tip div element
const div = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')

const fetchData = async () => {
    const data = await fetch('https://pomber.github.io/covid19/timeseries.json');
    const jsonData = await data.json();

    var countries = Object.keys(jsonData).map((country) => {
        return [country, jsonData[country]]
    })
    //parsing date
    var parseDate = d3.timeParse("%Y-%m-%d");
    countries.forEach(country => {
        country[1].forEach(day => {
            day.date = parseDate(day.date)
        })
    })

    //sorting country according to confirmed cases
    let days = countries[0][1].length;
    for (let i = 0; i < countries.length; i++) {
        countries.sort((a, b) => {
            return b[1][days - 1].confirmed - a[1][days - 1].confirmed;
        })
    }

    //add countrySelection
    let totalConfirmed = 0;
    let totalDeath = 0;
    let totalRecovered = 0;
    let totalConfirmedChange = 0;
    let totalDeathChange = 0;
    let totalRecoveredChange = 0;
    let countryWithHighestDeathRate = 0;
    countries.forEach(country => {
        const option = document.createElement("option");
        option.value = country[0];
        option.innerHTML = country[0];
        countrySelection.appendChild(option);

        const days = country[1].length;
        totalConfirmed += country[1][days - 1].confirmed;
        totalConfirmedChange += country[1][days - 2].confirmed
        totalRecovered += country[1][days - 1].recovered;
        totalRecoveredChange += country[1][days - 2].recovered;
        totalDeath += country[1][days - 1].deaths;
        totalDeathChange += country[1][days - 2].deaths;
        countryWithHighestDeathRate = countryWithHighestDeathRate > (country[1][days - 2].deaths / country[1][days - 2].confirmed) * 100 ? countryWithHighestDeathRate : (country[1][days - 2].deaths / country[1][days - 2].confirmed) * 100;
    })
    let totalActive = totalConfirmed - totalDeath - totalRecovered;
    totalConfirmedInDoc.innerHTML = totalConfirmed + `<span class="change"> (${totalConfirmed - totalConfirmedChange}+)</span>`;
    totalDeathsInDoc.innerHTML = totalDeath + `<span class="change"> (${totalDeath - totalDeathChange}+)</span>`;
    totalRecoveredInDoc.innerHTML = totalRecovered + `<span class="change"> (${totalRecovered - totalRecoveredChange}+)</span>`;
    let totalDeathRate = Math.floor((totalDeath * 100 / totalConfirmed) * 100) / 100;
    totalDeathRateInDoc.innerHTML = totalDeathRate + "%";
    let totalRecoveryRate = Math.floor((totalRecovered * 100 / totalConfirmed) * 100) / 100;
    totalRecoveryRateInDoc.innerHTML = totalRecoveryRate + "%";

    //Adding Donut char for whole wold data-----------------
    donutChart(totalActive,totalDeath);

    //////////////////////////////////--------Adding Multiline Graph-----------
    multiLineGraph(countries,days);

    ///////////////----------Table making-----------
    countries.forEach((country, index) => {
        let TR = document.createElement("tr");
        let TDcountry = document.createElement("td");
        let TDcases = document.createElement("td");
        let TDdeath = document.createElement("td");
        let TDdeathrate = document.createElement("td");
        let countryDeathRate = ((country[1][days - 1].deaths * 100) / country[1][days - 1].confirmed).toFixed(1);
        if (countryDeathRate < 10) {
            countryDeathRate = ". " + countryDeathRate;
        }
        let barWidth = (((country[1][days - 1].deaths / country[1][days - 1].confirmed) * 100) / countryWithHighestDeathRate) * 150;
        let deathRateBar = `<svg width="100" height="20">
            <rect width=${barWidth} height="20" fill="brown"></rect>
        </svg>`
        TDcountry.innerHTML = `${country[0]}`;
        TDcases.innerHTML = country[1][days - 1].confirmed;
        TDdeath.innerHTML = country[1][days - 1].deaths;
        TDdeathrate.innerHTML = countryDeathRate + "% " + deathRateBar;
        TR.append(TDcountry, TDcases, TDdeath, TDdeathrate)
        worldTable.appendChild(TR);
    })

}
fetchData()

//---------MultiLine Graph------------------------/////////////
const multiLineGraph = (countries, days) => {
    var LineGraphParent = document.getElementById('worldMultilineChart').parentElement;
    const lineGraphAxisMargin = { left: 60, top: 30, right: 80, bottom: 20 }
    const svgLineGraph = d3.select('#worldMultilineChart')
        .attr('width', LineGraphParent.offsetWidth)
        .attr('height', LineGraphParent.offsetWidth * .4)

    const gLineGraph = svgLineGraph.append('g')
        .attr('transform', `translate(${60},${30})`)

    const maxinfection = countries[0][1][days - 1].confirmed;
    //Graph from day 51 to till date
    const newData = [];
    countries.forEach(country => {
        let name = country[0];
        let data = [];
        for (let i = 50; i < days; i++) {
            data.push(country[1][i]);
        }
        let set = [];
        set.push(name);
        set.push(data);
        newData.push(set);
    })

    const xScale = d3.scaleTime()
        .domain(d3.extent(newData[0][1], d => d.date))
        //.domain([countries[0][1][50].date, countries[0][1][days-1].date])
        .range([0, LineGraphParent.offsetWidth])
        .nice()
    const xTicks = 6;
    const xAxis = d3.axisBottom(xScale)
        .ticks(xTicks)
    //.tickSize(-LineGraphParent.offsetHeight + 65);
    gLineGraph.append('g')
        .call(xAxis)
        .attr('class', 'xaxis')
        .attr('transform', `translate(${0},${LineGraphParent.offsetWidth * .4 - lineGraphAxisMargin.bottom - 30})`);

    const yScale = d3.scaleLinear()
        .domain([maxinfection, 0])
        .range([0, LineGraphParent.offsetWidth * .4 - 30])
        .nice()
    const yAxis = d3.axisLeft(yScale)
    //.tickSize(-LineGraphParent.offsetWidth + 70);;
    gLineGraph.append('g')
        .call(yAxis)
        .attr('class', 'yaxis')
        .attr('transform', `translate(${0},${-lineGraphAxisMargin.bottom})`)
    const lineColor = d3.scaleOrdinal().range(d3.schemeCategory10);
    const line = d3.line()
        .curve(d3.curveMonotoneX)
        .x(d => xScale(d.date))
        .y(d => yScale(d.confirmed));

    const top10 = [];
    for (let i = 0; i < 10; i++) {
        top10.push(newData[i]);
    }

    var country = gLineGraph.selectAll(".country")
        .data(top10)
        .enter()
        .append("g")
        .attr("class", d => `country ${d[0]}`);

    country.append('path')
        .attr('fill', 'none')
        .style("stroke", d => lineColor(d[0]))
        .attr("stroke-width", 1.5)
        .attr("d", d => line(d[1]))
        .attr('transform', `translate(${-60},${-lineGraphAxisMargin.bottom})`)
        .on('mouseover', d => {
            //console.log(d3.event, xScale(-d3.event.layerX*100))
            div
                .transition()
                .duration(200)
                .style('opacity', 0.9);
            div.html(
                `<span style="color:${lineColor(d[0])};font-size:16px;font-weight:bold">${d[0]}</span>`
                + '<br/>'
                + `<span style="color:${lineColor(d[0])};">total cases=${d[1][days - 1 - 50].confirmed}</span>`)
                .style('left', d3.event.pageX + 'px')
                .style('top', d3.event.pageY - 28 + 'px');
        })
    // .on('mouseout', () => {
    //     div
    //         .transition()
    //         .duration(500)
    //         .style('opacity', 0);
    // })
    country.append('text')
        .style("fill", d => lineColor(d[0]))
        .text(d => d[0])
        .style("font-weight", 600)
        .attr('x', d => xScale(d[1][days - 1 - 50].date) - 90)
        .attr('y', d => yScale(d[1][days - 1 - 50].confirmed) - 20)
        .attr('class', 'line-graph-country-legend')
    //.attr('translate',`transform(${0},${0})`)
}

//-----------Donut Chart---------------////////////
const donutChart=(totalActive,totalDeath)=>{
    var pieCharParent = document.getElementById('worldActivePieChart').parentElement;
    var pieChartWidth = pieCharParent.offsetWidth * 0.6;
    var radius = pieChartWidth / 2;
    const donutData = [{ label: 'totalRecovered', value: totalRecovered },
    { label: 'totalActive', value: totalActive },
    { label: 'totalDeath', value: totalDeath }];

    var worldActivePieChart = d3.select("#worldActivePieChart")
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
    worldActivePieChart
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
    worldActivePieChart
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
    worldActivePieChart
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


///////////filter in table
const searchCountry = () => {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("tableSearchInput");
    filter = input.value.toUpperCase();
    table = worldTable.parentNode;
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}