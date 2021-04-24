var donutChart = require('./donutChart');
multiLineGraph = require('./multiLineGraph');
//window.multiLineGraph = multiLineGraph;

const countrySelection = document.getElementById("countrySelection");
const totalConfirmedInDoc = document.getElementById("totalConfirmed");
const totalDeathsInDoc = document.getElementById("totalDeaths");
const totalRecoveredInDoc = document.getElementById("totalRecovered");
const totalDeathRateInDoc = document.getElementById("deathRate");
const totalRecoveryRateInDoc = document.getElementById("recoveryRate");
const worldTable = document.getElementById("worldTable");

countries = {};
window.days = 0;
//Tool tip div element
div = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')

const fetchData = async () => {
    const data = await fetch('https://pomber.github.io/covid19/timeseries.json');
    const jsonData = await data.json();

    countries = Object.keys(jsonData).map((country) => {
        return [country, jsonData[country]]
    })
    //parsing date
    var parseDate = d3.timeParse("%Y-%m-%d");
    countries.forEach(country => {
        country[1].forEach(day => {
            day.date = parseDate(day.date)
        })
    })

    days = countries[0][1].length;

    //add countrySelection
    let totalConfirmed = 0;
    let totalDeath = 0;
    let totalRecovered = 0;
    let totalConfirmedChange = 0;
    let totalDeathChange = 0;
    let totalRecoveredChange = 0;
    let countryWithHighestDeathRate = 0;

    countries.forEach(country => {
        const days = country[1].length;
        totalConfirmed += country[1][days - 1].confirmed;
        totalConfirmedChange += country[1][days - 2].confirmed
        totalRecovered += country[1][days - 1].recovered;
        totalRecoveredChange += country[1][days - 2].recovered;
        totalDeath += country[1][days - 1].deaths;
        totalDeathChange += country[1][days - 2].deaths;
        countryWithHighestDeathRate = countryWithHighestDeathRate > (country[1][days - 2].deaths / country[1][days - 2].confirmed) * 100 ? countryWithHighestDeathRate : (country[1][days - 2].deaths / country[1][days - 2].confirmed) * 100;
        if (country[0] === "US") {
            country[0] = "United State of America";
        }
    })

    let totalActive = totalConfirmed - totalDeath - totalRecovered;
    totalConfirmedInDoc.innerHTML = totalConfirmed + `<span class="change"> (${totalConfirmed - totalConfirmedChange}+)</span>`;
    totalDeathsInDoc.innerHTML = totalDeath + `<span class="change"> (${totalDeath - totalDeathChange}+)</span>`;
    totalRecoveredInDoc.innerHTML = totalRecovered + `<span class="change"> (${totalRecovered - totalRecoveredChange}+)</span>`;
    let totalDeathRate = Math.floor((totalDeath * 100 / totalConfirmed) * 100) / 100;
    totalDeathRateInDoc.innerHTML = totalDeathRate + "%";
    let totalRecoveryRate = Math.floor((totalRecovered * 100 / totalConfirmed) * 100) / 100;
    totalRecoveryRateInDoc.innerHTML = totalRecoveryRate + "%";

    //--------Adding Donut char for whole wold data---------
    donutChart(totalActive, totalDeath, totalRecovered);

    //--------Adding Multiline Graph------------------------
    multiLineGraph(countries, days, numberOfCountriesInLineChart);

    //--------Table making----------------------------------
    countries.forEach((country, index) => {
        let TR = document.createElement("tr");
        let TDcountry = document.createElement("td");
        let TDcases = document.createElement("td");
        let TDdeath = document.createElement("td");
        let TDdeathrate = document.createElement("td");
        let countryDeathRate = ((country[1][days - 1].deaths * 100) / country[1][days - 1].confirmed).toFixed(1);
        if (countryDeathRate < 10) {
            countryDeathRate = "<span style='color:rgba(0 , 0, 0, 0)'>. </span>" + countryDeathRate;
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

///////////filter in table
window.searchCountry = () => {
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
