const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const { messages } = JSON.parse(event.body);
    const apiKey = process.env.OPENAI_API_KEY;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: messages,
                max_tokens: 1000,
                stream: true  // Activer le streaming
            })
        });

        if (!response.ok) {
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: response.statusText })
            };
        }

        // Lire les données du flux
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let chunks = '';

        return new Promise((resolve, reject) => {
            function processText({ done, value }) {
                if (done) {
                    resolve({
                        statusCode: 200,
                        body: JSON.stringify({ choices: [{ message: { content: chunks } }] })
                    });
                    return;
                }

                chunks += decoder.decode(value, { stream: true });

                return reader.read().then(processText).catch(reject);
            }

            reader.read().then(processText).catch(reject);
        });

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Unable to get response from OpenAI.' })
        };
    }
};
