const countrySelection = document.getElementById("countrySelection");
const totalConfirmedInDoc = document.getElementById("totalConfirmed");
const totalDeathsInDoc = document.getElementById("totalDeaths");
const totalCriticalInDoc = document.getElementById("totalCritical");
const totalRecoveredInDoc = document.getElementById("totalRecovered");
const totalDeathRateInDoc = document.getElementById("deathRate");
const totalRecoveryRateInDoc = document.getElementById("recoveryRate");
const worldTable = document.getElementById("worldTable");

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

    //Tool tip div element
    const div = d3
        .select('body')
        .append('div')
        .attr('class', 'tooltip')

    //Adding Donut char for whole wold data
    var pie = d3.pie();
    var pieCharParent = document.getElementById('worldActivePieChart').parentElement;
    var pieChartWidth = pieCharParent.offsetWidth * 0.6;
    var donutColor = d3.scaleOrdinal(['brown', 'green', 'orange']);

    var worldActivePieChart = d3.select("#worldActivePieChart")
        .attr('width', pieChartWidth)
        .attr('height', pieChartWidth)

    var g = worldActivePieChart.append('g')
        .attr('transform', `translate(${pieChartWidth / 2},${pieChartWidth / 2})`)

    var arc = d3.arc()
        .innerRadius(pieChartWidth / 2 - 60)
        .outerRadius(pieChartWidth / 2 - 5)

    const donutData = {
        "totalRecovered": totalRecovered,
        "totalActive": totalActive,
        "totalDeath": totalDeath
    };
    var arcs = g.selectAll('arc')
        .data(pie([totalRecovered, totalActive, totalDeath]))
        .enter()
        .append('g')

    arcs.append('path')
        .attr("fill", function (d, i) {
            return donutColor(i);
        })
        .attr("d", arc)
        .on('mouseover', function (d) {
            //console.log(this, this.__data__.startAngle)
            // this.__data__.startAngle
            //this.__data__.startAngle+=0.4;
            div.transition()
                .duration(200)
                .style('opacity', 0.9);
            if (this.attributes[0].nodeValue == "orange") {
                div.html(
                    `Active Cases:<span style=";font-size:16px;font-weight:bold;color:orange"> ${this.__data__.value}</span>`
                )
            }
            else if (this.attributes[0].nodeValue == "brown") {
                div.html(
                    `Total Deaths:<span style=";font-size:16px;font-weight:bold;color:brown"> ${this.__data__.value}</span>`
                )
            }
            else if (this.attributes[0].nodeValue == "green") {
                div.html(
                    `Total Recovered:<span style=";font-size:16px;font-weight:bold;color:green"> ${this.__data__.value}</span>`
                )
            }

            div
                .style('left', d3.event.pageX + 'px')
                .style('top', d3.event.pageY - 28 + 'px');
        })
    //Adding legend in donut Chart
    const legendDonut = worldActivePieChart.append('g')
        .attr('class', 'legend-donut')
        .attr('transform', 'translate(40,150)');
    const blabla = {
        data: [{ label: 'totalRecovered', value: totalRecovered },
        { label: 'totalActive', value: totalActive },
        { label: 'totalDeath', value: totalDeath },
        ]
    }
    const lg = legendDonut.selectAll('g')
        .data(blabla.data)
        .enter()
        .append('g')
        .attr('transform', (d, i) => `translate(${120},${i * 30})`);
    lg.append('rect')
        .style('fill', d => donutColor(d.value))
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 10)
        .attr('height', 10);

    lg.append('text')
        .style('font-family', 'Georgia')
        .style('font-size', '13px')
        .attr('x', 17.5)
        .attr('y', 10)
        .text(d => d.label);

    //////////////////////////////////--------Adding Multiline Graph-----------
    var LineGraphParent = document.getElementById('worldMultilineChart').parentElement;

    const svgLineGraph = d3.select('#worldMultilineChart')
        .attr('width', LineGraphParent.offsetWidth)
        .attr('height', LineGraphParent.offsetWidth * .4)

    const gLineGraph = svgLineGraph.append('g')
        .attr('transform', `translate(${60},${30})`)

    const maxinfection = countries[0][1][countries[0][1].length - 1].confirmed;

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
        .tickSize(-LineGraphParent.offsetHeight + 65);
    gLineGraph.append('g')
        .call(xAxis)
        .attr('class', 'xaxis')
        .attr('transform', `translate(${0},${LineGraphParent.offsetWidth * .4 - 55})`);

    const yScale = d3.scaleLinear()
        .domain([maxinfection, 0])
        .range([0, LineGraphParent.offsetWidth * .4 - 30])
        .nice()
    const yAxis = d3.axisLeft(yScale)
        .tickSize(-LineGraphParent.offsetWidth + 70);;
    gLineGraph.append('g')
        .call(yAxis)
        .attr('class', 'xaxis')
        .attr('transform', `translate(${0},${-25})`)
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
        .attr("d", (d, i) => line(d[1]))
        .attr('transform', `translate(${-60},${-25})`)
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
        .attr('x', d => xScale(d[1][days - 1 - 50].date) - 60)
        .attr('y', d => yScale(d[1][days - 1 - 50].confirmed) - 20)
    //.attr('translate',`transform(${0},${0})`)

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
        let deathRateBar = `<svg width="170" height="20">
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