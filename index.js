'use strict'

// format is 'api_key=' if appending to searchURL
const apiKey = 'dwdmCH5b112ub3aqcBIcdHpa3tgfZVuCSNUdsvXU';
const searchURL = 'https://developer.nps.gov/api/v1/parks';

function formatQueryParams(params) {
    const queryItems = Object.keys(params)
        // Do not use encodeURIComponent for value since the query param 
        // contains commas that are escaped by encodeURIComponent.  This is
        // fine since users have standard selections as inputs
        .map(key => `${encodeURIComponent(key)}=${params[key]}`)
    return queryItems.join('&');
}

function getNationalParks(query, maxResults = 10) {
    const params = {
        stateCode: query.join(','),
        limit: maxResults,
        api_key: apiKey
    };

    const queryString = formatQueryParams(params);
    const url = searchURL + "?" + queryString;

    console.log(url);

    /*
    // Need to work out why adding the apiKey to the header in options
    // won't work.  Works in Postman but not here.  Only appending the key
    // as a query to the url works in the app.

    const options = {
        headers: new Headers({
            "X-Api-Key": apiKey
        })
    };
    */

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayResults(responseJson))
        .catch(error => {
            $('#js-error-message').text(`Something went wrong: ${error.message}`);
        });

}

function displayResults(responseJson) {
    console.log(responseJson);

    $('#js-results-list').empty();

    for (let i = 0; i < responseJson.data.length; i++) {

        $('#js-results-list').append(`
        <li>
            <h3>${responseJson.data[i].states.replace(/,/g, ' ')}</h3>`);

        // Needed conditional to display photo of park because
        // not all parks have photos.  Without this the app crashes.
        if (responseJson.data[i].images.length > 0) {
            $('#js-results-list').append(`
                <img src="${responseJson.data[i].images[0].url}" 
                alt="${responseJson.data[i].images[0].altText}">
            `);
        }

        $('#js-results-list').append(`

            <h4>Park</h4> 
                <p>${responseJson.data[i].fullName}</p>
            <h4>Description</h4> 
                <p>${responseJson.data[i].description}</p>
            <h4>Website</h4> 
                <p><a href="${responseJson.data[i].url}">${responseJson.data[i].url}</a></p>
        `);

        // Same reason as stated above for images. 
        if (responseJson.data[i].addresses.length > 0) {
            $('#js-results-list').append(`
            <h4>Address</h4>
                <p>${responseJson.data[i].addresses[1].line1}<br>
                ${responseJson.data[i].addresses[1].line2}<br>
                ${responseJson.data[i].addresses[1].city}, 
                ${responseJson.data[i].addresses[1].stateCode} 
                ${responseJson.data[i].addresses[1].postalCode}<br></p>
            </li>
            `);
        } else {
            $('#js-results-list').append(`
            <h4>Address</h4>
                <p>No Address Listed</p>
            </li>
            `);
        }
    }

    $('#results').removeClass('hidden');
}

function watchForm() {
    $('#js-form').submit(event => {
        event.preventDefault();
        const searchTerms = $('#js-state-search').val();
        const maxResults = $('#js-max-results').val();
        getNationalParks(searchTerms, maxResults);
    });
}

$(watchForm);