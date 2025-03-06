import express, { Request, Response } from 'express';
import { channel as rabbitChannel, connectToRabbitMQ } from './rabbitConnection';

const app = express();
const port = 3000;
app.use(express.json());



app.post('/orders', (req: Request, res: Response) => {
  if (!rabbitChannel) {
    return res.status(500).send('No channel found');
  }
  const { body: data } = req;
  rabbitChannel.sendToQueue(
    'order',
    Buffer.from(
      JSON.stringify({
        ...data,
        date: new Date(),
      })
    )
  );
  res.send('Order submitted');
});

app.get('/orders', async (req: Request, res: Response) => {
    if (!rabbitChannel) {
      return res.status(500).send('No channel found');
    }
    const message = await rabbitChannel.get('order');
    
    if (!message) {
      return res.send('No orders found');
    }

    const messageContent = JSON.parse(message.content.toString());

    res.send(messageContent)
  });

app.listen(port, async () => {
  await connectToRabbitMQ();
  console.log(`Server running on http://localhost:${port}`);
});
