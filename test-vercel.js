import Vercel from './model/Vercel.js';
import logger from './bin/winston.js';

// Sample eligible pages
const eligiblePages = [
  {
    City: 'Atlanta',
    State: 'GA'
  },
  {
    City: 'Marietta',
    State: 'GA'
  }
];

// Create a new instance of the Vercel class
const vercel = new Vercel();

// Test the triggerRebuild method
async function testVercelRebuild() {
  try {
    logger.info('Testing Vercel.triggerRebuild with sample pages...');
    const result = await vercel.triggerRebuild(eligiblePages);
    logger.info('Rebuild result: ' + (result ? 'Success' : 'Failed'));
  } catch (error) {
    logger.error('Error testing Vercel.triggerRebuild: ' + error.message);
  }
}

// Run the test
testVercelRebuild().then(() => {
  logger.info('Test completed');
});