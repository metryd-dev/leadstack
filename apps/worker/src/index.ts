import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sqs = new SQSClient({
  region: process.env.AWS_REGION ?? 'us-east-1',
  endpoint: process.env.AWS_ENDPOINT
});

async function processOutboxBatch() {
  const batchSize = Number(process.env.OUTBOX_BATCH_SIZE ?? 20);
  const events = await prisma.outboxEvent.findMany({
    where: { processedAt: null, attempts: { lt: 10 } },
    orderBy: { createdAt: 'asc' },
    take: batchSize
  });

  for (const event of events) {
    try {
      await sqs.send(
        new SendMessageCommand({
          QueueUrl: process.env.SQS_QUEUE_URL,
          MessageBody: event.payload,
          MessageAttributes: {
            topic: { DataType: 'String', StringValue: event.topic },
            outboxEventId: { DataType: 'String', StringValue: event.id }
          }
        })
      );

      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: { processedAt: new Date(), attempts: { increment: 1 }, lastError: null }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: { attempts: { increment: 1 }, lastError: message }
      });
    }
  }
}

async function start() {
  while (true) {
    await processOutboxBatch();
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}

void start();
