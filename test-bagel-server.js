#!/usr/bin/env node

const axios = require('axios');

async function testBagelServer() {
    const baseUrl = 'http://localhost:8000';
    
    console.log('🧪 Testing BAGEL Server Integration...\n');
    
    try {
        // Test health endpoint
        console.log('1. Testing health endpoint...');
        const healthResponse = await axios.get(`${baseUrl}/health`, { timeout: 5000 });
        console.log('✅ Health check passed:', healthResponse.data);
        
        // Test generate endpoint
        console.log('\n2. Testing code generation...');
        const generateResponse = await axios.post(`${baseUrl}/generate`, {
            prompt: 'Create a simple hello world function in Python',
            max_tokens: 100
        }, { timeout: 10000 });
        console.log('✅ Code generation response:', generateResponse.data);
        
        // Test explain endpoint
        console.log('\n3. Testing code explanation...');
        const explainResponse = await axios.post(`${baseUrl}/explain`, {
            code: 'def hello_world():\n    print("Hello, World!")',
            language: 'python'
        }, { timeout: 10000 });
        console.log('✅ Code explanation response:', explainResponse.data);
        
        console.log('\n🎉 All tests passed! BAGEL server is working correctly.');
        
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ BAGEL server is not running on localhost:8000');
            console.log('💡 The extension will use the embedded fallback server instead.');
        } else {
            console.log('❌ Error testing BAGEL server:', error.message);
        }
        
        console.log('\n📝 Note: The VS Code extension includes an embedded fallback server');
        console.log('   that provides basic functionality when the main BAGEL server is unavailable.');
    }
}

testBagelServer();