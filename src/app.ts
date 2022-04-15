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
import mysql2 from 'mysql2';
import 'dotenv/config';

const app = express();

const connectionString = process.env.DATABASE_URL || '';
console.log(connectionString)

var connection = mysql2.createConnection({
  host     : process.env.DATABASE_HOST,
  user     : process.env.DATABASE_USER,
  password : process.env.DATABASE_PASSWORD,
  database : process.env.DATABASE_NAME
}); 
connection.connect()

app.get('/api/characters', (req: Request, res: Response) => {
  const query = "SELECT * FROM Characters";
  connection.query(query, (err, rows) => {
    if(err) throw err;
    const retVal = {
      data: rows,
      message: Array.isArray(rows) && rows.length === 0 ? "No records found" : null
    }
    return res.send(retVal);
  })
})

app.get('/api/characters/:id', (req: Request, res: Response) => {
  const id = req.params.id

  const query = `SELECT * FROM Characters WHERE ID = ${id} LIMIT 1`;
  connection.query(query, (err, rows) => {
    if(err) throw err;
    const retVal = {
      data: Array.isArray(rows) && rows.length > 0 ? rows[0] : null,
      message: Array.isArray(rows) && rows.length === 0 ? "No record found" : null
    }
    return res.send(retVal);
  })
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("App is running");
});