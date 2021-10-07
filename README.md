# Crowd Microservices
Demo of Crowd Microservices environment




[![Watch the video](https://github.com/devuxd/CrowdCode/blob/Emad/public/img/CM_demo.png)](https://www.youtube.com/watch?v=qQeYOsRaxHc)

Crowd Microservices follows client-server architecture with three layers: 1) a web client, implemented in AngularJS, which runs on a worker's browser, 2) a backend, implemented in Node.js, and 3) a persistence store, implemented using Firebase Real-time Database. 

## Running Crowd Microservices on the local machine
1. install Node.js
2. Run `node ./bin/www` in terminal 
3. In the Chrome go to this URL `HTTP://localhost:3000/{_project_name_}`
4. For adding a new project, CrowdCode has admin dashboard. It is accessible via `http://localhost:3000/clientRequest`
5. For deploying completed microservices on another repository which is connected to Heroku should configure GitHub username and password in _deployment_service.js_ file. After updating information and re-run Node.js it is accessible via URL: `HTTP://localhost:3000/{_project_name_}/deploy`!
