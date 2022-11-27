  import TelegramBot from 'node-telegram-bot-api';
  import got from 'got';

  const token = process.env.TELEGRAM_API_KEY || '5867082415:AAEx7FgKaXqMiHpDegv9OX-umFGvuXGbVXs';
  const bot = new TelegramBot(token, {polling: true});




  /**
   * Metodo que pega o json 'cru' da API e da uma limpada
   * 
   * retorna o total de resultados, a busca, e os items.
   *
   * */
  const cleanMessage = async (json, numberOfItems, searchTerm) => {
    
    const parsed = JSON.parse(json);
    const totalResults = parsed.totalResults || 0;
    let returnStting = `busca: <b>${searchTerm}</b>
total de resultados: <b>${totalResults}</b>

`;


  if(parsed.items && parsed.items.length >= numberOfItems) {

     for (var i = 0; i < numberOfItems; i++) {

   returnStting+= `${parsed.items[i].title}
link = ${parsed.items[i].link}
fonte = ${parsed.items[i].source}

`;
    }
    return returnStting;

  } else if(parsed.items && parsed.items.length >= 0) {

       for (var i = 0; i < parsed.items.length; i++) {

   returnStting+= `${parsed.items[i].title}
link = ${parsed.items[i].link}
fonte = ${parsed.items[i].source}

`;
    }
    return returnStting;

  } 

    return returnStting;
  }



  /**
   * /start e /ajuda
   * 
   * */
  const startMsg = `Bem vindo ao <a href="https://buscafatos.com.br/">Busca Fatos</a> <b>BETA</b>.

Simplesmente nos envie uma mensagem e ela será verificada.

Exemplo; <b>urna eletrônica</b>

Sempre que precisar digite  <b>/ajuda</b>

Para buscas ordenadas por data <b>DECRESCENTE</b>,
utilize o comando <b>/recentes</b> Exemplo;

<b>/recentes urna eletrônica</b>

Para controlar o número de itens retornados basta colocar # número ( 1 a 10 ) Exemplo;

<b>/recentes urna eletrônica #9</b>
ou
<b>urna eletrônica #9</b>

Ambas as buscas acima trarão 9 resultados. A busca de cima traz os
resultados ordenados por data <b>DECRESCENTE</b>.

Temos também uma <a href="https://busca-fatos.fly.dev/">Interface Web</a> para consulta.

`;

bot.onText(/\/start/, (msg) => {

  bot.sendMessage(msg.chat.id, startMsg, {parse_mode: 'HTML'});

});

bot.onText(/\/ajuda/, (msg) => {

  bot.sendMessage(msg.chat.id, startMsg, {parse_mode: 'HTML'});

});


  // Matches "/recentes [whatever]"
  bot.onText(/\/recentes (.+)/, async (msg, match) => {

    const chatId = msg.chat.id;

      let username = '';
      if (msg.from.username) {
        username = msg.from.username;
      }

    let searchTerm = match[1];

    let arr = searchTerm.split('#');
    let numberOfResults = 3; // default

    if (arr && arr.length > 1) {
      numberOfResults = arr[1];
      searchTerm = arr[0];
    }

    console.log(`username = [${username}] - keyword = [${searchTerm}] and nOfResults = [${numberOfResults}]`)

    const url = `https://busca-fatos.deno.dev/v1/search/${searchTerm}?raw=0&count=${numberOfResults}&sort=date`;
    // console.log(`fetching keyword = [${searchTerm}]`)
    const data = await got(url).text();
    // console.log(data)
    const response = await cleanMessage(data, numberOfResults, searchTerm);
    // console.log(response);


    bot.sendMessage(chatId, response, {parse_mode: 'HTML'});
  });


  bot.on('message', async (msg) => {

    if (!msg.text) {
      return;
    }

    if (!msg.text.includes('/start') && !msg.text.includes('/recentes')
       && !msg.text.includes('/ajuda')) {

      // console.log(msg.text)
      // console.log('@')

      const chatId = msg.chat.id;
      // console.log(msg);

      let username = '';
      if (msg.from.username) {
        username = msg.from.username;
      }
      
      let searchTerm = msg.text;

      let arr = searchTerm.split('#');
      let numberOfResults = 3; // default

      if (arr && arr.length > 1) {
        numberOfResults = arr[1];
        searchTerm = arr[0];
      }

      console.log(`username = [${username}] - keyword = [${searchTerm}] - nOfResults = [${numberOfResults}]`)

      const url = `https://busca-fatos.deno.dev/v1/search/${searchTerm}?raw=0&count=${numberOfResults}`;
      // console.log(`fetching keyword = [${searchTerm}]`)
      const data = await got(url).text();
      // console.log(data)
      const response = await cleanMessage(data, numberOfResults, searchTerm);
      // console.log(response);


      bot.sendMessage(chatId, response, {parse_mode: 'HTML'});

    }

  });