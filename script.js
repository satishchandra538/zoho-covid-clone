const countrySelection = document.getElementById("countrySelection");
const totalConfirmedInDoc = document.getElementById("totalConfirmed");

const fetchData = async () => {
    const data = await fetch('https://pomber.github.io/covid19/timeseries.json');
    const jsonData = await data.json();
    
    const countries = Object.keys(jsonData).map((country) => {
        return [country, jsonData[country]]
    })

    //add countrySelection
    let totalConfirmed = 0;
    let totalDeath = 0;
    let totalRecovered = 0;
    countries.forEach(country=>{
        const option = document.createElement("option");
        option.value = country[0];
        option.innerHTML = country[0];
        countrySelection.appendChild(option);

        const days = country[1].length;
        totalConfirmed+=country[1][days-1].confirmed;
        totalRecovered += country[1][days - 1].recovered;
        totalDeath += country[1][days - 1].deaths;
    })
    let totalActive = totalConfirmed-totalDeath-totalRecovered;
    totalConfirmedInDoc.innerHTML = totalConfirmed;
}
fetchData()
