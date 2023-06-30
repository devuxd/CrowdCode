# Crowd Microservices
Demo of Crowd Microservices environment




[![Watch the video](https://github.com/devuxd/CrowdCode/blob/Emad/public/img/CM_demo.png)](https://www.youtube.com/watch?v=qQeYOsRaxHc)


Crowd Microservices follows client-server architecture with three layers: 1) a web client, implemented in AngularJS, which runs on a worker's browser, 2) a back-end, implemented in Node.js, and 3) a persistence store, implemented using Firebase Real-time Database. 

## Running Crowd Microservices on the local machine
1. Install [Node.js](https://nodejs.org/en/download/) for your platform
2. Run `npm install express` to install the [express framework](https://expressjs.com)
3. Run `node ./bin/www` or `npm start` in terminal 
4. In Google Chrome go to this URL `http://localhost:3000/{_project_name_}`
5. For adding a new project, Crowd Microservices has admin dashboard. It is accessible via `http://localhost:3000/clientRequest`
6. For deploying completed microservices on another repository which is connected to Heroku, configure GitHub username and password in `./util/deployment_service.js` file. After updating the information, re-run Node.js and access it via URL: `HTTP://localhost:3000/{_project_name_}/deploy`!
