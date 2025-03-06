import { Channel, ChannelModel, connect } from "amqplib";

const RECONNECTION_TIMEOUT = 5000;

let channel: Channel | null = null;
let connection: ChannelModel | null = null;

export const connectToRabbitMQ = async () => {
  try {
    const amqpServer = 'amqp://localhost:5672';
    connection = await connect(amqpServer) as ChannelModel;
    if (!connection) return;
    channel = await connection.createChannel();
    if (!channel) return;
    await channel.assertQueue('order');

    connection.on('close', () => {
      setTimeout(connect, RECONNECTION_TIMEOUT);
    });

    connection.on('error', (err) => {
      console.error('Rabbit error: ', err);
    });

  } catch (error) {
    console.error('Error while connect to rabbit: ', error);
    setTimeout(connect, RECONNECTION_TIMEOUT);
  }
}

export { channel, connection };