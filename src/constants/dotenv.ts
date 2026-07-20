require('dotenv').config({ quiet: true });

const dotenv = {
  BASE_URL: process.env.BASE_URL || '',
};

export default dotenv;
