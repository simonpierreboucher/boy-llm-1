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
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: response.statusText })
            };
        }

        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Unable to get response from OpenAI.' })
        };
    }
};
