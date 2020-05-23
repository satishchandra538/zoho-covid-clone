const countrySelection = document.getElementById("countrySelection");
const totalConfirmedInDoc = document.getElementById("totalConfirmed");
const totalDeathInDoc = document.getElementById("totalDeaths");
const totalCriticalInDoc = document.getElementById("totalCritical");
const totalRecoveredInDoc = document.getElementById("totalRecovered");
const totalDeathRateInDoc = document.getElementById("deathRate");
const totalRecoveryRateInDoc = document.getElementById("recoveryRate");

const fetchData = async () => {
    const data = await fetch('https://pomber.github.io/covid19/timeseries.json');
    const jsonData = await data.json();

    const countries = Object.keys(jsonData).map((country) => {
        return [country, jsonData[country]]
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

    //Adding Donut char for whole wold data
    var pie = d3.pie();
    var pieCharParent = document.getElementById('worldActivePieChart').parentElement;
    var pieChartWidth = pieCharParent.offsetWidth;
    var worldActivePieChart = d3.select("#worldActivePieChart")
        .attr('width', pieChartWidth)
        .attr('height', pieChartWidth)

    console.log(pieChartWidth)

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
        .on('mouseover', (d) => {
            console.log(d);
        });

    arcs.append('path')
        .attr("fill", function (d, i) {
            return color(i);
        })
        .attr("d", arc)

    //Adding Multiline Graph

}
fetchData()
