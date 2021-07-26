import { createInterface } from "readline";
import { URL } from "url";
import request from "request";

const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const POSTCODES_BASE_URL = "https://api.postcodes.io";
const TFL_BASE_URL = "https://api.tfl.gov.uk";

export default class ConsoleRunner {
  ///////////
  // Helpers
  ///////////
  formatPostcode(postcode) {
    return postcode.replace(/\s/g, "");
  }

  buildUrl(url, endpoint, parameters) {
    const requestUrl = new URL(endpoint, url);
    parameters.forEach((param) =>
      requestUrl.searchParams.append(param.name, param.value)
    );
    return requestUrl.href;
  }

  displayStopPoints(stopPoints) {
    stopPoints.forEach((point) => {
      console.log(point.commonName);
    });
  }

  ///////////
  // Async
  ///////////

  promptForPostcode() {
    return new Promise(function (resolve) {
      readline.question("\nEnter your postcode: ", (postcode) =>
        resolve(postcode)
      );
    });
  }

  getLocationForPostCode(postcode) {
    return this.makeGetRequest(
      POSTCODES_BASE_URL,
      `postcodes/${postcode}`,
      []
    ).then((responseBody) => {
      return {
        latitude: JSON.parse(responseBody).result.latitude,
        longitude: JSON.parse(responseBody).result.longitude,
      };
    });
  }

  makeGetRequest(baseUrl, endpoint, parameters) {
    const url = this.buildUrl(baseUrl, endpoint, parameters);
    return new Promise(function (resolve, reject) {
      request.get(url, (err, response, body) => {
        if (err) {
          reject(err);
        } else if (response.statusCode !== 200) {
          reject(response.statusCode);
        } else {
          resolve(body);
        }
      });
    });
  }

  getNearestStopPoints(latitude, longitude, count) {
    return this.makeGetRequest(TFL_BASE_URL, `StopPoint`, [
      { name: "stopTypes", value: "NaptanPublicBusCoachTram" },
      { name: "lat", value: latitude },
      { name: "lon", value: longitude },
      { name: "radius", value: 1000 },
      { name: "app_id", value: "" /* Enter your app id here */ },
      { name: "app_key", value: "" /* Enter your app key here */ },
    ]).then((responseBody) => {
      return JSON.parse(responseBody)
        .stopPoints.map(function (entity) {
          return { naptanId: entity.naptanId, commonName: entity.commonName };
        })
        .slice(0, count);
    });
  }

  ///////////
  // Run
  ///////////

  run() {
    const that = this;
    // Prompt postcode
    that
      .promptForPostcode()
      .then((postcode) => that.formatPostcode(postcode))
      .then((formattedPostcode) =>
        that.getLocationForPostCode(formattedPostcode)
      )
      .then((location) =>
        that.getNearestStopPoints(location.latitude, location.longitude, 5)
      )
      .then((nearestStops) => that.displayStopPoints(nearestStops))
      .catch((error) => {
        console.log(`There has been an error: ${error}`);
      });
  }
}
