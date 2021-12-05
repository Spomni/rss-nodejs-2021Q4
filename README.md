# simple-crud-api

## Install

Clone this repository to your device
```bash
git clone https://github.com/Spomni/simple-crud-api.git
```

Go to the created folder
```bash
cd simple-crud-api/
```

Checkout to the actual development branch
```bash
git checkout task-3/dev
```

Install dependencies
```bash
npm i
```

## Start server

An application can be started in two modes: **development** and **production**.<br>
When server is starting, an application will print message to the console. This message tells you which port, host and mode is used.<br>
To stop server, terminate its process by pressing the keys combination `Ctrl+C`.

### Development mode

To start server in development mode, run the next command in the terminal.

```bash
npm run start:dev
```

Server will start from source files and all internal server errors will be printed to the console.

### Production mode

To start server in production mode, run the next command in the terminal.

```bash
npm run start:prod
```

This command runs webpack to build an application and to put them into the `dist/` folder.<br>
When building is completed the server will started from the build file `dist/main.js`.

### Setup Environment

To setup port and host thats are used to listen a server, you can add `.env` file.<br>
To read env file, an application use the `dotenv` module. Read its [documentation](https://github.com/motdotla/dotenv#readme) to know how to works with the `.env` file.<br>
If an env file does not exist an application will listen `localhost` on the port `3000`.

## Run Tests

An application repository has four commands to test it.

### Unit Tests
```bash
npm test
```

### Unit Tests With Coverage
```bash
npm run test:coverage
```

### E2E Tests
```bash
npm run test:e2e
```

### Series of E2E Tests and Unit Tests With Coverage
```bash
npm run test:full
```

## Web API

An application implement a very simple REST Like API that is reachable by url `http://${host}:${port}/person`.

### Accepted Methods

* **GET** `/person` returns all persons as JSON array.
* **GET** `/person/${personId}` returns person with corresponding `personId` as JSON object.
* **POST** `/person` is used to create record about new person and store it in database. It returns a created person as JSON object.
* **PUT** `/person/${personId}` is used to update record about existing person. It returns a created an person as JSON object.
* **DELETE** `/person/${personId}` is used to delete record about existing person from database. It returns nothing (status code "204 No Content")

### Person Object

Persons are stored as `objects` that have following properties:
  * `id` — unique identifier (`string`, `uuid`) generated on server side
  * `name` — person's name (`string`, **required**)
  * `age` — person's age (`number`, **required**)
  * `hobbies` — person's hobbies (`array` of `strings` or empty `array`, **required**)

You need to pass a JSON object with all required properties to the `POST` method.<br>
You can pass a JSON object with one or more required properties to the `PUT` method.<br>
Other methods do not require any request body.
