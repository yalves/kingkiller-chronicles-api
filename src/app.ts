/*
docker run \
--detach \
--name=mysql \
--env="MYSQL_ROOT_PASSWORD=senha123" \
--publish 3306:3306 \
--volume=/storage/docker/mysql-data:/var/lib/mysql \
mysql

CREATE TABLE Characters (
  id int NOT NULL,
  name varchar(255) NOT NULL,
  species varchar(255) DEFAULT NULL,
  image varchar(255) DEFAULT NULL,
  PRIMARY KEY ( id )
) ENGINE=InooDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO Characters (id, name, species, image) VALUES (1, "Yan", "Cool", "asopdijasiodjasd")
*/
import express, { Request, Response } from "express";
import mysql from 'mysql';

const app = express();

const connectionString = process.env.DATABASE_URL || '';
const connection = mysql.createConnection(connectionString);
connection.connect();

app.get('/api/characters', (req: Request, res: Response) => {
  const query = "SELECT * FROM Characters";
  connection.query(query, (err, rows) => {
    if(err) throw err;

    return res.send(rows);
  })

  res.send("It works!")
})

app.get('/api/characters/:id', (req: Request, res: Response) => {
  const id = req.params.id
  res.send("It works with id " + id)
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("App is running");
});