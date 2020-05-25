const countrySelection = document.getElementById("countrySelection");
const totalConfirmedInDoc = document.getElementById("totalConfirmed");
const totalDeathInDoc = document.getElementById("totalDeaths");
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
    countries.forEach(country => {
        const option = document.createElement("option");
        option.value = country[0];
        option.innerHTML = country[0];
        countrySelection.appendChild(option);

        const days = country[1].length;
        totalConfirmed += country[1][days - 1].confirmed;
        totalRecovered += country[1][days - 1].recovered;
        totalDeath += country[1][days - 1].deaths;
    })
    let totalActive = totalConfirmed - totalDeath - totalRecovered;
    totalConfirmedInDoc.innerHTML = totalConfirmed + ' <i class="fa fa-long-arrow-up"></i>';
    //totalActiveInDoc.innerHTML = totalActive + ' <i class="fa fa-long-arrow-up"></i>';
    totalDeathInDoc.innerHTML = totalDeath + ' <i class="fa fa-long-arrow-up"></i>';
    totalRecoveredInDoc.innerHTML = totalRecovered + ' <i class="fa fa-long-arrow-up"></i>';
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
    var pieChartWidth = pieCharParent.offsetWidth;
    var worldActivePieChart = d3.select("#worldActivePieChart")
        .attr('width', pieChartWidth)
        .attr('height', pieChartWidth)

    var g = worldActivePieChart.append('g')
        .attr('transform', `translate(${pieChartWidth / 2},${pieChartWidth / 2})`)
    var color = d3.scaleOrdinal(['green', 'orange', 'brown']);
    var arc = d3.arc()
        .innerRadius(pieChartWidth / 2 - 70)
        .outerRadius(pieChartWidth / 2 - 15)
    var arcs = g.selectAll('arc')
        .data(pie([totalRecovered, totalActive, totalDeath]))
        .enter()
        .append('g')

    arcs.append('path')
        .attr("fill", function (d, i) {
            return color(i);
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
                    `<span style=";font-size:16px;font-weight:bold;color:orange">Active Cases=${this.__data__.value}</span>`
                )
            }
            else if (this.attributes[0].nodeValue == "brown") {
                div.html(
                    `<span style=";font-size:16px;font-weight:bold;color:brown">Total Deaths=${this.__data__.value}</span>`
                )
            }
            else if (this.attributes[0].nodeValue == "green") {
                div.html(
                    `<span style=";font-size:16px;font-weight:bold;color:green">Total Recovered=${this.__data__.value}</span>`
                )
            }

            div
                .style('left', d3.event.pageX + 'px')
                .style('top', d3.event.pageY - 28 + 'px');
        })

    //Adding Multiline Graph-----------
    var LineGraphParent = document.getElementById('worldMultilineChart').parentElement;

    const svgLineGraph = d3.select('#worldMultilineChart')
        .attr('width', LineGraphParent.offsetWidth)
        .attr('height', pieChartWidth)

    const gLineGraph = svgLineGraph.append('g')
        .attr('transform', `translate(${60},${0})`)

    const maxinfection = countries[0][1][countries[0][1].length - 1].confirmed;

    const xScale = d3.scaleTime()
        .domain(d3.extent(countries[0][1], d => d.date))
        .range([0, LineGraphParent.offsetWidth])
        .nice()
    const xTicks = 6;
    const xAxis = d3.axisBottom(xScale)
        .ticks(xTicks);
    gLineGraph.append('g')
        .call(xAxis)
        .attr('class', 'xaxis')
        .attr('transform', `translate(${0},${pieChartWidth - 25})`);

    const yScale = d3.scaleLinear()
        .domain([maxinfection, 0])
        .range([0, pieChartWidth])
        .nice()
    const yAxis = d3.axisLeft(yScale);
    gLineGraph.append('g')
        .call(yAxis)
        .attr('class', 'xaxis')
        .attr('transform', `translate(${0},${-25})`)
    const lineColor = d3.scaleOrdinal().range(d3.schemeCategory10);
    const line = d3.line()
        .curve(d3.curveMonotoneX)
        .x(d => xScale(d.date))
        .y(d => yScale(d.confirmed));

    const top10 = countries.splice(0, 10);

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
        .attr('transform', `translate(${-10},${-25})`)
        .on('mouseover', d => {
            div
                .transition()
                .duration(200)
                .style('opacity', 0.9);
            div.html(
                `<span style="color:${lineColor(d[0])};font-size:16px;font-weight:bold">${d[0]}</span>`
                + '<br/>'
                + `<span style="color:${lineColor(d[0])};">total cases=${d[1][days - 1].confirmed}</span>`)
                .style('left', d3.event.pageX + 'px')
                .style('top', d3.event.pageY - 28 + 'px');
        })
        // .on('mouseout', () => {
        //     div
        //         .transition()
        //         .duration(500)
        //         .style('opacity', 0);
        // })

    //Table making

    //console.log(worldTable.parentElement)
    worldTable.parentElement=60
    countries.forEach((country, index) => {
        let Sr = index + 1 + '.';
        let TR = document.createElement("tr");
        let TDcountry = document.createElement("td");
        let TDconfirmed = document.createElement("td");
        let TDrecovered = document.createElement("td");
        let TDdeath = document.createElement("td");
        let TDactive = document.createElement("td");
        TDconfirmed.classList.add('confirmed');
        TDrecovered.classList.add('recover');
        TDdeath.classList.add('death');
        TDactive.classList.add('active');
        TDcountry.innerHTML = country[0];
        TDconfirmed.innerHTML=country[1][days-1].confirmed;
        TDrecovered.innerHTML = country[1][days - 1].recovered;
        TDdeath.innerHTML = country[1][days - 1].deaths;
        TDactive.innerHTML = country[1][days - 1].confirmed - country[1][days - 1].recovered - country[1][days - 1].deaths;
        TR.append(Sr, TDcountry, TDconfirmed, TDrecovered, TDdeath, TDactive)
        worldTable.appendChild(TR);
    })
}
fetchData()