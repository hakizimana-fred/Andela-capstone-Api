# Blogs REST API with Express & MongoDB

Nodejs api with express and mongoose ORM

## how to use

To get started with this api follow the steps below

```shell
$ git clone https://github.com/hakizimana-fred/Blog-app-api
$ cd blog-api
$ yarn install or npm install
```

## DATABASE
* This Api  uses mongodb database.
  * [ ] Have mongodb installe in your system or you can use mongodb clusters
  * [ ] You don't need to worry about creating tables, mongoose will immediately create respective collections for you
## START THE SERVER 
```shell
$ yarn start or npm start

```
## ENVIRONMENT VARIABLES

* Create **.env** file in the main directory and add the following

```shell
    JWT_SECRET="JWT SECRET"
    PORT= "Put port number you wish your server to run on"
    MONGO_URI= "mongodb url"
```

