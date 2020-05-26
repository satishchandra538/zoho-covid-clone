const countrySelection = document.getElementById("countrySelection");
const totalConfirmedInDoc = document.getElementById("totalConfirmed");
const totalDeathInDoc = document.getElementById("totalDeaths");
const totalCriticalInDoc = document.getElementById("totalCritical");
const totalRecoveredInDoc = document.getElementById("totalRecovered");
const totalDeathRateInDoc = document.getElementById("deathRate");
const totalRecoveryRateInDoc = document.getElementById("recoveryRate");
const worldTable = document.getElementById("worldTable");
const totalConfirmedChangeInDoc = document.getElementById('totalConfirmedChange');
const totalDeathChangeInDoc = document.getElementById('totalDeathChange');
const totalRecoveredChangeInDoc = document.getElementById('totalRecoveredChange');

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
        totalDeathChange += country[1][days - 2].deaths
    })
    let totalActive = totalConfirmed - totalDeath - totalRecovered;
    totalConfirmedInDoc.innerHTML = totalConfirmed + ' <i class="fa fa-long-arrow-up"></i>';
    totalConfirmedChangeInDoc.innerHTML = totalConfirmed - totalConfirmedChange + "+";
    //totalActiveInDoc.innerHTML = totalActive + ' <i class="fa fa-long-arrow-up"></i>';
    totalDeathInDoc.innerHTML = totalDeath + ' <i class="fa fa-long-arrow-up"></i>';
    totalDeathChangeInDoc.innerHTML = totalDeath - totalDeathChange + "+";
    totalRecoveredInDoc.innerHTML = totalRecovered + ' <i class="fa fa-long-arrow-up"></i>';
    totalRecoveredChangeInDoc.innerHTML = totalRecovered - totalRecoveredChange + "+";
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
    console.log(donutColor());
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


    //-----------------Adding Multiline Graph-----------
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


    //Table making
    //worldTable.parentElement = 60;
    console.log(worldTable)
    countries.forEach((country, index) => {
        let Sr = index + 1 + '.';
        let TR = document.createElement("tr");
        let TDserial = document.createElement("td");
        let TDcountry = document.createElement("td");
        let TDconfirmed = document.createElement("td");
        let TDrecovered = document.createElement("td");
        let TDdeath = document.createElement("td");
        TDconfirmed.classList.add('primary-bg');
        TDrecovered.classList.add('orange-bg');
        TDdeath.classList.add('red-bg');
        TDcountry.classList.add('country-bg');
        TDserial.classList.add('serial-bg')
        TDserial.innerHTML = Sr;
        TDcountry.innerHTML = `${country[0]}`; //+`<img src='' alt='🏁' />`
        TDconfirmed.innerHTML = country[1][days - 1].confirmed;
        TDrecovered.innerHTML = country[1][days - 1].recovered;
        TDdeath.innerHTML = country[1][days - 1].deaths;
        TR.append(TDserial, TDcountry, TDconfirmed, TDrecovered, TDdeath)
        worldTable.appendChild(TR);
    })
}
fetchData()