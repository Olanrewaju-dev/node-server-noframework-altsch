// require node modules
const http = require("http");
const fs = require("fs");
const path = require("path");

//importing local data
const fruitsDbPath = path.join(__dirname, "db", "fruits.json");
let fruitsDb = [];

const PORT = 3001;
const HOSTNAME = "localhost";

const requestHandler = (req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.url === "/fruits" && req.method === "GET") {
    getAllFruits(req, res);
  } else if (req.url.startsWith("/fruits/") && req.method === "GET") {
    getFruit(req, res);
  } else if (req.url === "/fruits" && req.method === "POST") {
    addFruit(req, res);
  } else if (req.url === "/fruits" && req.method === "PUT") {
    updateFruit(req, res);
  } else if (req.url === "/fruits" && req.method === "DELETE") {
    deletFruit(req, res);
  }
};

// Create item
// Get all items
// Get one item
// Update item
// Delete item

// 2.a - Create Item
// POST to local fruits database
const addFruit = (req, res) => {
  const body = [];
  req.on("data", (chunk) => {
    body.push(chunk);
  });

  req.on("end", () => {
    const parsedFruit = Buffer.concat(body).toString();
    const newFruit = JSON.parse(parsedFruit);

    //dynamically adding id to fruit item inputs
    const lastFruit = fruitsDb[fruitsDb.length - 1];
    const lastFruitId = lastFruit.id;
    newFruit.id = lastFruitId + 1;

    // saving to fruitsDB
    fruitsDb.push(newFruit);
    fs.writeFile(fruitsDbPath, JSON.stringify(fruitsDb), (err) => {
      if (err) {
        res.writeHead(404);
        res.end(
          JSON.stringify({
            message: "An Error Has Occurred",
          })
        );
      }

      res.end(JSON.stringify(newFruit));
    });
  });
};

// 2.b - Get All Items
// GET all fruits from database
const getAllFruits = (req, res) => {
  fs.readFile(fruitsDbPath, "utf8", (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end("Internal server error");
    }
    res.writeHead(200);
    res.end(data);
  });
};

// 2.c - Get One Fruit Item
const getFruit = (req, res) => {
  const id = req.url.split("/")[2]; // saving the id parse into the url

  const fruitItems = fs.readFileSync(fruitsDbPath); // reading db to get all fruits item
  const fruitsArrObj = JSON.parse(fruitItems); // converting the buffer into objects

  const fruitItemIndex = fruitsArrObj.findIndex((fruit) => {
    return fruit.id === parseInt(id); // finding the index of the fruit item in the db
  });

  if (!fruitItemIndex) {
    res.writeHead(404);
    res.end("Error, resource not found"); //handling error if item not found
  }
  res.end(JSON.stringify(fruitsArrObj[fruitItemIndex])); // return formatted obj data of the single fruit item
};

// 2.d - Update Item
// UPDATE a particular fruits item in the database
const updateFruit = (req, res) => {
  const body = [];
  req.on("data", (chunk) => {
    body.push(chunk);
  });

  req.on("end", () => {
    const parsedBody = Buffer.concat(body).toString();
    const newFruitUpdateData = JSON.parse(parsedBody);

    //find fruit item in the database
    const fruitIndex = fruitsDb.findIndex((fruit) => {
      return fruit.id === newFruitUpdateData.id;
    });

    // console.log("The index is " + fruitIndex);

    //handle error when fruit item is not found
    if (fruitIndex === -1) {
      res.writeHead(404);
      res.end(
        JSON.stringify({
          message: "Error, fruit item not found",
        })
      );
    }

    // update the fruit item in the database
    fruitsDb[fruitIndex] = { ...fruitsDb[fruitIndex], ...newFruitUpdateData };

    fs.writeFile(fruitsDbPath, JSON.stringify(fruitsDb), (err) => {
      if (err) {
        res.writeHead(500);
        res.end(
          JSON.stringify({
            message: "Error, could not find fruit to update",
          })
        );
      }
      res.end(JSON.stringify(fruitsDb));
    });
  });
};

// 2.e - Delete Item
// DELETE a particular fruits item in the database
const deletFruit = (req, res) => {
  const body = [];
  req.on("data", (chunk) => {
    body.push(chunk);
  });

  req.on("end", () => {
    const parsedBody = Buffer.concat(body).toString();
    const fruitToDelete = JSON.parse(parsedBody);

    //find fruit item to delete in the database
    const fruitIndex = fruitsDb.findIndex((fruit) => {
      return fruit.id === fruitToDelete.id;
    });

    console.log("The index is " + fruitIndex);

    //handle error when fruit item is not found
    if (fruitIndex === -1) {
      res.writeHead(404);
      res.end(
        JSON.stringify({
          message: "Error, fruit item not found",
        })
      );
    }

    fruitsDb.splice(fruitIndex, 1); // remove the fruit from the database using the index

    // updating fruitsDb
    fs.writeFile(fruitsDbPath, JSON.stringify(fruitsDb), (err) => {
      if (err) {
        console.log(err);
        res.writeHead(500);
        res.end(
          JSON.stringify({
            message:
              "Internal Server Error. Could not delete fruit from database.",
          })
        );
      }

      res.end(
        JSON.stringify({
          message: "Book deleted",
        })
      );
    });
  });
};

// server declaration using http network protocol
const server = http.createServer(requestHandler);

// setting server port and hostname
server.listen(PORT, HOSTNAME, () => {
  fruitsDb = JSON.parse(fs.readFileSync(fruitsDbPath, "utf8"));
  console.log(`Server is listening on ${HOSTNAME}:${PORT}`);
});
