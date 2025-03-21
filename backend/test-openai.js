require('dotenv').config();
console.log('Script started');

// Çevresel değişkenleri kontrol et
console.log('ENV Variables check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
if (process.env.OPENAI_API_KEY) {
  const keyStart = process.env.OPENAI_API_KEY.substring(0, 8);
  const keyEnd = process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 4);
  console.log('API Key Format:', `${keyStart}...${keyEnd}`);
  console.log('API Key Length:', process.env.OPENAI_API_KEY.length);
} else {
  console.log('❌ API Key not found in environment variables!');
  console.log('Available env variables:', Object.keys(process.env).filter(key => !key.includes('SECRET')));
}

// OpenAI'ı yükle
try {
  console.log('\nLoading OpenAI module...');
  const { OpenAI } = require('openai');
  console.log('✅ OpenAI module loaded successfully');

  async function testOpenAI() {
    try {
      console.log('\nInitializing OpenAI client...');
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      console.log('✅ OpenAI client initialized');

      console.log('\nTesting simple completion...');
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant. Keep it very short." },
          { role: "user", content: "Say hello in Turkish." }
        ],
        max_tokens: 50
      });
      
      console.log('✅ Completion successful!');
      console.log('Response:', completion.choices[0].message.content);
      
    } catch (error) {
      console.error('\n❌ OpenAI test failed:');
      
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error('Error data:', JSON.stringify(error.response.data, null, 2));
      } else if (error.message) {
        console.error('Error message:', error.message);
        
        if (error.message.includes('authentication')) {
          console.error('\n🛑 This appears to be an authentication error. Your API key might be invalid.');
          console.error('Check that your API key is correctly formatted and has not expired.');
        }
        
        if (error.message.includes('wrong format')) {
          console.error('\n🛑 Your API key appears to be in the wrong format.');
          console.error('OpenAI API keys typically start with "sk-" followed by a string of characters.');
        }
      } else {
        console.error('Unknown error:', error);
      }
    }
  }

  // Run the test
  testOpenAI();
  
} catch (moduleError) {
  console.error('\n❌ Failed to load OpenAI module:', moduleError.message);
} 