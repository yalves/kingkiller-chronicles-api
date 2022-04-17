import axios from 'axios';
import cheerio from 'cheerio';
import mysql2 from 'mysql2';
import 'dotenv/config';

var connection = mysql2.createConnection({
  host     : process.env.DATABASE_HOST,
  user     : process.env.DATABASE_USER,
  password : process.env.DATABASE_PASSWORD,
  database : process.env.DATABASE_NAME
}); 
connection.connect();

const getCharacterPageNames = async () => {
  const url = "https://kingkiller.fandom.com/wiki/Category:Characters"
  const {data} = await axios.get(url);
  const $ = cheerio.load(data);
  const categories = $('ul.category-page__members-for-char');

  const characterPageNames = []
  for(let i = 0; i < categories.length; i++) {
    const ul = categories[i];
    const charactersLIs = $(ul).find('li.category-page__member');

    for(let j = 0; j < charactersLIs.length; j++) {
      const li = charactersLIs[j];
      const path = $(li).find('a.category-page__member-link').attr('href') || "";
      const name = path?.replace('/wiki/', "");
      characterPageNames.push(name);
    }
  }

  return characterPageNames;
}

const getCharacterInfo = async (characterName: string) => {
  if (characterName.includes('Category')) return null;
  
  const baseUrl = "https://kingkiller.fandom.com/wiki/";
  const {data} = await axios.get(`${baseUrl}${characterName}`);
  const $ = cheerio.load(data);

  let name = $('h2[data-source="name"]').text();
  if(!name) {
    name = characterName.replace('_', ' ');
  }

  if(!name) return null;

  const species = $('div[data-source="species"] > div.pi-data-value.pi-font').text();
  const image = $('.image.image-thumbnail > img').attr('src');
  const characterInfo = {
    name, species, image
  }
  return characterInfo;
}

const loadCharacters = async () => {
  const characterPageNames = await getCharacterPageNames();
  const characterInfoPromises = characterPageNames.map(characterName => getCharacterInfo(characterName) ?? null);
  const characters = await Promise.all(characterInfoPromises);
  const values = characters.filter(n => n).map((character, i) => [i, character?.name, character?.species, character?.image]);
  console.log(characters);
  const sql = "INSERT INTO Characters (id, name, species, image) VALUES ?";
  connection.query(sql, [values], (err) => {
    if(err) {
      console.error("AHHHH, it didn't work")
      console.error(err)
    } else{
      console.log("YAAAAY DB is populated")
    }
  })
  // const characterInfoArr = []
  // for(let i = 0; i < characterPageNames.length; i++) {
  //   const characterInfo = await getCharacterInfo(characterPageNames[i]);
  //   if(characterInfo) characterInfoArr.push(characterInfo);
  // }
  // console.log(characterInfoArr);
}

// getCharacterPageNames();
loadCharacters();