const express = require('express');
const app = express();
const builder = require('botbuilder');

const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD,
});

const bot = new builder.UniversalBot(connector, async (session) => {
    const { text } = session.message;

    console.log(text);
});

bot.set('storage', new builder.MemoryBotStorage());

const recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/788b7228-ee4a-4616-ba7b-51f008f3ea70?verbose=true&timezoneOffset=-360&subscription-key=a426cd2b818c492ab5392b0920a606e3&q=');
bot.recognizer(recognizer);

bot.dialog('DeliveryIntent', function (session, args) {
    console.log(args.intent.entities);
    const numberEntity = builder.EntityRecognizer.findEntity(
        args.intent.entities,
        'builtin.number',
    );

    const comidaEntity = builder.EntityRecognizer.findEntity(
        args.intent.entities,
        'comida',
    );

    const saborEntity = builder.EntityRecognizer.findEntity(
        args.intent.entities,
        'sabor',
    );

    session.send('Eu entendi que você deseja:');

    if (numberEntity) {
        session.send('Quantidade: ' + numberEntity.entity + ' (' + numberEntity.resolution.value + ')');
    }

    if (comidaEntity) {
        session.send('Comida: ' + comidaEntity.entity);
    }

    if (saborEntity) {
        session.send('Sabor: ' + saborEntity.entity);
    }
    
    session.endDialog();
}).triggerAction({
    matches: 'DeliveryIntent',
    onInterrupted: (session) => {
      session.endDialog('Houve um erro');
    },
  });

bot.dialog('GreetingIntent', function (session) {
    session.send('Olá, tudo bem? Eu sou um chatbot delivery, por favor faça seu pedido.');
}).triggerAction({
    matches: 'GreetingIntent',
    onInterrupted: (session) => {
      session.endDialog('Houve um erro');
    },
  });

app.post('/api/messages', connector.listen());

app.listen(process.env.PORT || 4000, () => {
    console.log('Iniciado em http://localhost:4000');
});
