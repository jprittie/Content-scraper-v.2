## Build a content scraper with Node and Promises
*Project 6 of Treehouse Full Stack JavaScript course*

### In this project, I went back and rewrote my original content scraper using promises. 


### Instructions:
* Run `git clone https://github.com/jprittie/Content-scraper-with-Node` command to clone the project on your local machine.
* Run `npm install` command to install all the necessary dependencies.
* Run `npm start` command to start the project with the node server. This will run the scraper; the results will be written to a new .csv file in the data folder.


### Project objectives:
Imagine you work at a price comparison website. You’ve been given the task of creating a Node.js command line application that goes to an ecommerce site to get the latest prices and save them to a spreadsheet (CSV format). This spreadsheet will be used by another application to populate a database. The application you build will be run once every day. To complete this project, you'll need to research and use npm packages that will help you scrape a website and create a CSV file.

### Specific instructions:
* Create a scraper.js file. This should be the file that runs every day.
* The scraper should create a folder called data, if a folder called data doesn't already exist (it should check for the folder).
* The information from the site you scrape should be stored in a CSV file named after today's date:
2016-01-29.csv.
* Use a third party npm package to scrape content from the site. The scraper should be able to visit the website http://shirts4mike.com and follow links to all T-shirts.
* The scraper should get the price, title, url and image url from the product page and save it in the
CSV.
* Use a third party npm package to create a CSV file.
* The column headers should be in this order: Title, Price, ImageURL, URL and Time. "Time" should
be the time the scrape happened. The columns must be in order.
* If the site is down, an error message describing the issue should appear in the console. You can test
your error by disabling the Wi-Fi on your computer.
* If the data file for today’s date already exists, your program should overwrite the file.

