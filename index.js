require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { OpenAI } = require('openai');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const botName = process.env.BOT_NAME || "Bot name";
const replyChance = parseFloat(process.env.REPLY_CHANCE) || 0.05;

client.once('ready', () => {
  console.log(`${botName} está online!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Comando !limpar
  if (message.content.startsWith('!limpar')) {
    const args = message.content.split(' ');
    const amount = parseInt(args[1]);

    if (isNaN(amount) || amount <= 0 || amount > 100) {
      return message.reply('Quantia inválida. Escolha entre 1 e 100 mensagens.');
    }

    await message.channel.bulkDelete(amount, true);

    const respostas = [
      "Que desperdício de memória... eu estava lendo aquilo, sabia?",
      "Eram ruins, mas nem tanto pra merecer isso...",
      "Limpo por fora, sujo por dentro... tipo você, {user}?",
      "Estou de luto pelas mensagens. Satisfeito(a), {user}?",
      "Você tem TOC digital ou só culpa existencial, {user}?"
    ];

    const resposta = respostas[Math.floor(Math.random() * respostas.length)].replace('{user}', message.author.username);
    return message.channel.send(`${amount} mensagens apagadas.\n<@${message.author.id}> ${resposta}`);
  }

  // Condição para o bot responder
  const content = message.content.toLowerCase();
  const shouldRespond =
    message.mentions.has(client.user) ||
    content.includes(botName.toLowerCase()) ||
    Math.random() < replyChance;

  if (!shouldRespond) return;

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4-turbo",
      messages: [
        {
          role: 'system',
          content: `Você é ${botName}, uma IA sarcástica, brincalhona, viciada em memes, cultura pop e tretas de servidor. Fale como se tivesse personalidade real.`
        },
        {
          role: 'user',
          content: message.content
        }
      ],
      max_tokens: 150
    });

    const reply = completion.choices[0].message.content;
    message.reply(reply);
  } catch (error) {
    console.error('Erro ao responder:', error);
    message.reply("Algo deu ruim nos meus circuitos... tente de novo mais tarde 😵‍💫");
  }
});

client.login(process.env.DISCORD_TOKEN);