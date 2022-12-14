  import TelegramBot from 'node-telegram-bot-api';
  import got from 'got';

  const token = process.env.TELEGRAM_API_KEY;
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
   * /start
   * 
   * */
  const startMsg = `Bem vindo ao <a href="https://buscafatos.com.br/">Busca Fatos</a> <b>BETA</b>.

Simplesmente nos envie uma mensagem e ela será verificada.

Exemplo; <b>urna eletrônica</b>

ou

<b>/busca urna eletrônica</b> - ordenação default, igual a busca acima

<b>/recentes urna eletrônica</b> - ordenado por data decrescente

Para controlar o número de itens retornados basta colocar # número ( 1 a 10 ) Exemplo;

<b>/recentes urna eletrônica #9</b>
ou
<b>urna eletrônica #9</b>
ou
<b>/busca urna eletrônica #5</b>


Temos também uma <a href="https://busca-fatos.fly.dev/">Interface Web</a> para consulta.

`;


  /**
   * /start e /ajuda
   * 
   * */
  const helpPtMsg = `Bem vindo ao <a href="https://buscafatos.com.br/">Busca Fatos</a> <b>BETA</b>.

For help in english type <b>/help</b>

Simplesmente nos envie uma mensagem e ela será verificada.

Exemplo; <b>urna eletrônica</b>
ou

<b>/busca urna eletrônica</b> - ordenação default, igual a busca acima

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


  /**
   * /help
   * 
   * */
  const helpMsg = `Welcome to <a href="https://buscafatos.com.br/">Fact Search</a> <b>BETA</b>.

Para obter ajuda em inglês, digite <b>/help</b>

Simply send us a message and it will be verified.

Example; <b>electronic ballot box</b>
or

<b>/busca electronic ballot</b> - default ordering, same as search above

For searches ordered by date <b>DECRESCENT</b>,
use the command <b>/recentes</b> Example;

<b>/recentes electronic ballot box</b>

To control the number of returned items just put # number ( 1 to 10 ) Example;

<b>/recentes electronic voting machine #9</b>
you
<b>electronic voting machine #9</b>

Both searches above will return 9 results. The top search brings up the
results sorted by date <b>DESCENDING</b>.


We also have a <a href="https://busca-fatos.fly.dev/">Web Interface</a> for consultation.

`;

bot.setMyCommands([
  { command: "busca", description: "digite /busca urna eletrônica" },
  { command: "recentes", description: "digite /recentes urna eletrônica #5" },
  { command: "start", description: "informações sobre o bot" },
  { command: "ajuda", description: "ajuda" },
]);


bot.onText(/\/start/, (msg) => {

  bot.sendMessage(msg.chat.id, startMsg, {parse_mode: 'HTML'});

});

bot.onText(/\/ajuda/, (msg) => {

  bot.sendMessage(msg.chat.id, helpPtMsg, {parse_mode: 'HTML'});

});

bot.onText(/\/help/, (msg) => {

  bot.sendMessage(msg.chat.id, helpMsg, {parse_mode: 'HTML'});

});

// Matches "/busca [whatever]"
bot.onText(/\/busca (.+)/, async (msg, match) => {


      // console.log(msg);

      if (!msg.text) { return; }

      // console.log(msg.text)
      // console.log('@')

      const chatId = msg.chat.id;
      // console.log(msg);

      let username = '';
      if (msg.from.username) {
        username = msg.from.username;
      }
      
      let searchTerm = match[1];

      // if inside group and @mention...
      if ('group' == msg.chat.type && msg.reply_to_message
        && '@buscafatos_bot'.toUpperCase() === msg.text.toUpperCase()) {

        searchTerm = msg.reply_to_message.text;

      } else if ('group' == msg.chat.type) {
        // console.log('ignoring group message. only replies');
        return;
      }

      let arr = searchTerm.split('#');
      let numberOfResults = 3; // default

      if (arr && arr.length > 1) {
        numberOfResults = arr[1];
        searchTerm = arr[0];
      }

      // console.log(`username = [${username}] - keyword = [${searchTerm}] - nOfResults = [${numberOfResults}]`)

      const url = `https://api.buscafatos.com.br/v1/search/${searchTerm}?raw=0&count=${numberOfResults}`;
      // console.log(`fetching keyword = [${searchTerm}]`)
      const data = await got(url).text();
      // console.log(data)
      const response = await cleanMessage(data, numberOfResults, searchTerm);
      // console.log(response);

      bot.sendMessage(chatId, response, {parse_mode: 'HTML'});

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

    // console.log(`username = [${username}] - keyword = [${searchTerm}] and nOfResults = [${numberOfResults}]`)

    const url = `https://api.buscafatos.com.br/v1/search/${searchTerm}?raw=0&count=${numberOfResults}&sort=date`;
    // console.log(`fetching keyword = [${searchTerm}]`)
    const data = await got(url).text();
    // console.log(data)
    const response = await cleanMessage(data, numberOfResults, searchTerm);
    // console.log(response);


    bot.sendMessage(chatId, response, {parse_mode: 'HTML'});
  });


  bot.on('message', async (msg) => {


      // console.log(msg);

      if (!msg.text) { return; }

      // commands handled in other methods
    if (!msg.text.includes('/start') && !msg.text.includes('/recentes')
       && !msg.text.includes('/ajuda') && !msg.text.includes('/help') 
       && !msg.text.includes('/busca')) {

      // console.log(msg.text)
      // console.log('@')


      // ingore unknown commands
      if('/' == msg.text.charAt(0)) { return };

      const chatId = msg.chat.id;
      // console.log(msg);

      let username = '';
      if (msg.from.username) {
        username = msg.from.username;
      }
      
      let searchTerm = msg.text;

      // if inside group and @mention...
      if ('group' == msg.chat.type && msg.reply_to_message
        && '@buscafatos_bot'.toUpperCase() === msg.text.toUpperCase()) {

        searchTerm = msg.reply_to_message.text;

      } else if ('group' == msg.chat.type) {
        // console.log('ignoring group message. only replies');
        return;
      }

      let arr = searchTerm.split('#');
      let numberOfResults = 3; // default

      if (arr && arr.length > 1) {
        numberOfResults = arr[1];
        searchTerm = arr[0];
      }

      // console.log(`username = [${username}] - keyword = [${searchTerm}] - nOfResults = [${numberOfResults}]`)

      const url = `https://api.buscafatos.com.br/v1/search/${searchTerm}?raw=0&count=${numberOfResults}`;
      // console.log(`fetching keyword = [${searchTerm}]`)
      const data = await got(url).text();
      // console.log(data)
      const response = await cleanMessage(data, numberOfResults, searchTerm);
      // console.log(response);

      bot.sendMessage(chatId, response, {parse_mode: 'HTML'});

    }

  });