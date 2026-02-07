import { DeleteMessageCommand, ReceiveMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN ?? '');
const sqs = new SQSClient({ region: process.env.AWS_REGION ?? 'us-east-1', endpoint: process.env.AWS_ENDPOINT });

bot.start(async (ctx) => {
  await ctx.reply('LeadStack bot is running.');
});

async function fetchEnabledChats() {
  const response = await fetch(`${process.env.INTERNAL_API_URL}/telegram/chats`, {
    headers: { 'X-Internal-Token': process.env.INTERNAL_API_TOKEN ?? '' }
  });
  if (!response.ok) {
    return [] as Array<{ chatId: string; enabled: boolean }>;
  }

  const data = (await response.json()) as Array<{ chatId: string; enabled: boolean }>;
  return data.filter((chat) => chat.enabled);
}

async function pollQueue() {
  const queueUrl = process.env.SQS_QUEUE_URL;
  if (!queueUrl) {
    return;
  }

  const response = await sqs.send(
    new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      WaitTimeSeconds: 10,
      MaxNumberOfMessages: 10,
      MessageAttributeNames: ['All']
    })
  );

  if (!response.Messages?.length) {
    return;
  }

  const chats = await fetchEnabledChats();

  for (const message of response.Messages) {
    if (!message.Body || !message.ReceiptHandle) {
      continue;
    }

    for (const chat of chats) {
      await bot.telegram.sendMessage(chat.chatId, `New event: ${message.Body}`);
    }

    await sqs.send(new DeleteMessageCommand({ QueueUrl: queueUrl, ReceiptHandle: message.ReceiptHandle }));
  }
}

async function start() {
  await bot.launch();
  while (true) {
    await pollQueue();
  }
}

void start();
