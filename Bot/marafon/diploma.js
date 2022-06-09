const { API, Upload, Updates } = require('vk-io');
const Az = require('az');
const fs = require('fs');
const path = require('path');
const { pdfToPng } = require('pdf-to-png-converter');
const fontKit = require('@pdf-lib/fontkit');
const { PDFDocument } = require('pdf-lib');

const Log = require('../../Utils/log');

const MarafonParticipantService = require('../../Services/marafonParticipant');

const { QuestionManager } = require('vk-io-question');

async function marafonDiplomaBot () {

  const api = new API({
    token: "vk1.a.CaR81mKkl6WCRmzFdDOh_KsU77eHiRnNvJtD8ROVm6NkerFAQPjlU-eUZ9yeHwNCaD2gF4NDPgYJyCNmkFdvESDGOC16oGeo8U3YCYXPOxQ6FFR1_L_aw5px57Iwa93ICD5h1StamVzYCsFMrSkyWBKctFAASVBYAjvzmVM2BmcokUI0CSfcmRH2e0WsPUE3"
  });

  const upload = new Upload({
    api
  });

  const updates = new Updates({
    api,
    upload
  });

  async function sendDiploma (context, user, vkID) {
    const fullName = `${user.name} ${user.surname}`.toUpperCase();
    await context.send(`${user.name}, звоню главному, чтобы тебе первому выписали диплом`);
    await context.send({ sticker_id: 10037 });
    const pdfDoc = await PDFDocument.load(fs.readFileSync(path.join(__dirname, 'src/template.pdf'), null).buffer)
    pdfDoc.registerFontkit(fontKit);
    const customFont = await pdfDoc.embedFont(fs.readFileSync(path.join(__dirname, 'src/avenirnextcyr-bold.otf')));
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    firstPage.drawText(fullName, { x: 72, y: 500, font: customFont, size: 24 })

    const diplomaPDFArray8 = await pdfDoc.save()

    const diplomaPDF = Buffer.from(diplomaPDFArray8);
    const diplomaPNG = await pdfToPng(diplomaPDF, { outputFileMask: 'buffer', viewportScale: 2.0 });

    await context.sendPhotos({ value: diplomaPNG[0].content }, { message: 'Спасибо за участие в Марафоне идей! Держи свой диплом' });
    await context.sendDocuments({ value: diplomaPDF, filename: 'YaVDele_diplom.pdf', contentType: 'application/pdf' }, { message: 'Это в формате PDF, его можно распечатать' });
    await context.send({ sticker_id: 10031 });

    await context.send('Подпишись на это сообщество, чтобы не пропустить много классных мероприятий 😊');
  }

  const questionManager = new QuestionManager();

  updates.use(questionManager.middleware);

  updates.on('message', async context => {
    const vkID = context.peerId;
    const message = context.text;
    const hooks = ['диплом', 'сертификат', 'сертефикат', 'сертифекат', 'сертефекат', 'lbgkjv'];
    const tokens = Az.Tokens(message).done(['WORD']);
    let action = false;
    tokens.map(token => {
      const word = (token.source.substring(token.st, token.st + token.length)).toLowerCase();
      if (hooks.includes(word)) {
        action = true;
      }
    })

    await context.send({ sticker_id: 10027 });

    if (action) {
      const userDB = await MarafonParticipantService.getAll({ vkID }, ['name', 'surname', 'uuid']);
      if (userDB.length < 1) {
        await context.send('Мы не можем найти тебя в участниках Марафона идей');
        return;
      }
      const user = userDB[0].dataValues;

      const answer = await context.question(
        `Тебя зовут ${user.name} ${user.surname}? Правильно?`
      );

      if (/да|правильно|верно|точно|yes|так и есть|lf/i.test(answer.text)) {
        sendDiploma(context, user, vkID);
        return;
      }

      const answerName = await context.question('Введи имя');
      const answerSurname = await context.question('Введи фамилию');

      let userOld = {};
      Object.assign(userOld, user)

      user.name = answerName.text;
      user.surname = answerSurname.text

      sendDiploma(context, user, vkID);

      await Log.add({
        userID: vkID,
        action: 'update',
        aimModel: 'marafonParticipant',
        aimID: user.uuid,
        previousValue: { name: userOld.name, surname: userOld.surname },
        serviceNote: 'From VK bot'
      });
      await MarafonParticipantService.update({ name: user.name, surname: user.surname }, user.uuid);
    }
  });

  updates.start().catch(console.error);
}

module.exports = marafonDiplomaBot;