'use strict';

// Require modules
var request = require("request");
var fs = require("fs");
var cheerio = require("cheerio");
var converter = require("json-2-csv");
var moment = require("moment");


// Instantiate variables
var url = "http://shirts4mike.com";


// Create re-usable request promise
// This will be used in each of the scrapes
const requestPromise = function(url) {
    return new Promise(function(resolve, reject) {
        request(url, function(error, response, html) {

            if(error) return reject(error);
            if(!error && response.statusCode == 200){
                return resolve(html);
            }
        });
    });
}

// Set up promise chain
firstScrape(url)
  .then(filterLinks)
  .then(secondScrape)
  .then(thirdScrape)
  .then(writeToFile)
  .catch(function(error) {
    // Handle any error from any request here
    console.log(error);
  });


// First scrape, which is scrape of home page
function firstScrape(url){
  return requestPromise(url)
    .then(function(html) {
      var $ = cheerio.load(html);
      var firstScrapeLinks = [];

      // Find any links that contain the substring "shirt"
      $("a[href*='shirt']").each(function() {
        // Get the href of those links, and add that to the home page url
        var link = $(this);
        var href = link.attr("href");
        var newUrl = url + "/" + href;

        // Eliminate duplicate links, then add urls to an array
        if (firstScrapeLinks.indexOf(newUrl) === -1) {
          firstScrapeLinks.push(newUrl);
        }
      }); // ends each

      return (firstScrapeLinks);
    }) // ends then
    .catch(function(error){
      console.log("First scrape failed.");
      displayError(error);
  }); // ends catch
} // ends firstScrape


// Separate out product-page urls from urls needed for second scrape
function filterLinks(firstScrapeLinks){
  var productPages = [];
  var linksForSecondScrape = [];
  for (var i = 0; i < firstScrapeLinks.length; i++) {
    // If link is a product page(i.e., a page with "?id=" in its url ), add it to the productPages array
    if (firstScrapeLinks[i].indexOf("?id=") > 0) {
      productPages.push(firstScrapeLinks[i]);
    } else {
    // If link is not a product page, scrape on that link
      linksForSecondScrape.push(firstScrapeLinks[i]);
    }
  }
    // Return both arrays
    return {productPages: productPages, linksForSecondScrape: linksForSecondScrape};

} // ends filterLinks


// Second scrape, which targets any urls that aren't product pages
function secondScrape(filterObj){
  // Access the two arrays returned by filterLinks()
  var productPages = filterObj.productPages;
  var linksForSecondScrape = filterObj.linksForSecondScrape;
  var promiseArray = [];

  for(var j = 0; j < linksForSecondScrape.length; j++){
      promiseArray.push(requestPromise(linksForSecondScrape[j]));
      var promises = Promise.all(promiseArray);
  }
  return(promises)
    .then(function(promises) {
      for (var k = 0; k < promises.length; k++) {
        var $ = cheerio.load(promises[k]);
        // Find any links that contain "shirt.php?id=", as those are product pages
        $("a[href*='shirt.php?id=']").each(function() {
          // Get the href of those links, and add that to the home page url
          var link = $(this);
          var href = link.attr("href");
          var newUrl = url + "/" + href;

          // Eliminate duplicate links, then add urls to productPages array
          if (productPages.indexOf(newUrl) === -1) {
            productPages.push(newUrl);
          }
        }); // ends each
      } // ends for
      return productPages;
    }) // ends then
    .catch(function(error){
      console.log("Second scrape failed.");
      displayError(error);
    }) // ends catch
} // ends secondScrape



// Third and final scrape, which will target all product pages
function thirdScrape(productPages){
  console.log("productPages array at start of thirdScrape: " + productPages);
  var shirtsData = [];
  var promiseArray = [];

  for (var l = 0; l < productPages.length; l++) {
      promiseArray.push(requestPromise(productPages[l]));
      var promises = Promise.all(promiseArray);
  }
  return(promises)
    .then(function(promises) {
      for (var m = 0; m < promises.length; m++) {
        var $ = cheerio.load(promises[m]);

        // Get data for each shirt
        var price = $(".shirt-details h1 .price").text();
        console.log(price);
        var shirtUrl = productPages[m];
        var title = $(".shirt-details h1").text().slice(4);
        console.log(title);
        var imageUrl = "http://www.shirts4mike.com/" + $(".shirt-picture img").attr("src");
        console.log(imageUrl);
        var time = new Date().toLocaleString();

        var shirtDetails = {
          Title: title,
          Price: price,
          ImageUrl: imageUrl,
          Url: shirtUrl,
          Time: time
        };
        shirtsData.push(shirtDetails);
      } // ends for
      console.log(shirtsData);
      return shirtsData;
    }) // ends then
    .catch(function(error){
      console.log("Third scrape failed.");
      displayError(error);
    }) // ends catch

} // ends thirdScrape


// When all links are scraped, write to file
function writeToFile(shirtsData){
  // Create data folder if it doesn't exist
  if (!fs.existsSync("./data")) {
    fs.mkdirSync("./data");
  }
  // Use json-2-csv module to convert JSON
  converter.json2csv(shirtsData, function(error, csv) {
    if (error) {
      displayError(error);
    } else {
      console.log("Writing to csv file.");
      var newcsvname = "./data/" + scraperDate() + ".csv";
      fs.writeFile(newcsvname, csv, function(error) {
        if (error) {
          displayError(error);
        }
      }); // ends fs.writeFile
    } // ends else
  }); // ends converter
} // ends writeToFile()


// must check format of timestamp
/** Gets today's date and formats it for csv file name
* @return {string} date
*/
function scraperDate() {
  var d = new Date();
  var year = d.getFullYear();
  var month = (d.getMonth() + 1);
  var day = d.getDate();
  if (month.length < 2) {
    month = "0" + month;
  }
  if (day.length < 2) {
    day = "0" + day;
  }

  return [year, month, day].join('-');
} // ends scraperDate

/** Displays errors in console and logs them to scraper-error.log
* @param {object} error - any errors thrown by callbacks
*/
function displayError(error) {
  console.log(error.message);
  var errorTime = new Date().toLocaleString();
  var errorLog = error.message + " " + errorTime;

  // Writes to error log
  fs.appendFile('scraper-error.log', errorLog, function(error) {
    if (error) throw error;
  }); // ends appendFile
}
