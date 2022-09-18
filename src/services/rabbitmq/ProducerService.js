const amqp = require('amqplib');

const ProducerService = {
    sendMessage: async (queue, messages) => {
        const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
        const channel = await connection.createChannel();

        await channel.assertQueue(queue, { durable: true });
        await channel.sendToQueue(queue, Buffer.from(JSON.stringify(messages)));

        setTimeout(() => {
            connection.close();
        }, 500);
    },
};

module.exports = ProducerService;
