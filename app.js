const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const DbPath = path.join(__dirname, "cricketTeam.db");
let Db = null;

const initializeDBAndServer = async () => {
  try {
    Db = await open({
      filename: DbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("server is running");
    });
  } catch (error) {
    console.log(`DB error: ${error}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
//API 1
app.get("/players/", async (request, response) => {
  let getPlayersQuery = `
    SELECT * FROM 
    cricket_team
    ORDER BY 
    player_id;`;
  const getData = await Db.all(getPlayersQuery);
  response.send(
    getData.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//API 2
app.post("/players/", async (request, response) => {
  const playersDetails = request.body;
  const { playerName, jerseyNumber, role } = playersDetails;
  const addPlayersQuery = `
  INSERT INTO cricket_team (player_name,jersey_number,role)
  VALUES ('${playerName}',${jerseyNumber},'${role}');
  `;

  const resData = await Db.run(addPlayersQuery);
  response.send("Player Added to Team");
});

//API 3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getSinglePlayersQuery = `
  SELECT * FROM cricket_team
  WHERE player_id = ${playerId}
  ;`;
  const resData = await Db.get(getSinglePlayersQuery);
  response.send(resData);
});

//API 4
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerDetails = `
  UPDATE cricket_team
  SET 
  player_name = '${playerName}',
  jersey_number = ${jerseyNumber},
  role = '${role}'
  WHERE player_id = ${playerId};
  `;
  await Db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

//API 5
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
  DELETE FROM cricket_team
  WHERE player_id = ${playerId};
  `;
  await Db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
