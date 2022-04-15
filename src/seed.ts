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

  const characterPageNames = ["name"]
  for(let i = 0; i < categories.length; i++) {
    const ul = categories[i];
    const charactersLIs = $(ul).find('li.category-page__member');

    for(let j = 0; j < charactersLIs.length; j++) {
      const li = charactersLIs[j];
      const path = $(li).find('a.category-page__member-link').attr('href') || "";
      const name = path?.replace('/wiki/', "");
      characterPageNames.push(name);
      console.log(name);
    }
  }

  return characterPageNames;
}

const getCharacterInfo = async (characterName: string) => {
  const baseUrl = "https://kingkiller.fandom.com/wiki/";
  const {data} = await axios.get(`${baseUrl}${characterName}`);
  const $ = cheerio.load(data);
}

const loadCharacters = async () => {
  const characterPageNames = await getCharacterPageNames();
  for(let i = 0; i < characterPageNames.length; i++) {
    const characterInfo = await getCharacterInfo(characterPageNames[i]);
  }
}

getCharacterPageNames();