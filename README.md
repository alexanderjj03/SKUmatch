# SKUmatch - Completed in August 2024

I worked on this project as part of an internship that took place during Summer 2024. It consists of a backend which parses product data from excel spreadsheets into an intermediate representation, which somewhat resembles a hierarchical database. Written in Typescript, the backend also provides the necessary functionality for the user to search for invididual products based on their attributes. 

Meanwhile, the frontend, created using React.js, provides an intuitive UI for the user to browse through the various products. It was carefully designed to minimize server traffic and prevent user misuse (e.g. creating invalid queries). Nevertheless, using the nodemailer package, the developers will get email-notified of any unusual errors.

For demomstration purposes, a sample set of product data is provided in the externalData folder.

To properly install this project, please make sure you have yarn (v > 1.22.16 && v < 1.23), node 18, and npm installed.
Before executing any of the tests, make sure to run "yarn install" in the terminal.
