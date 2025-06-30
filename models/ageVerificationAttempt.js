const db = require('../db');

const AgeVerificationAttempt = {
  create: (data, callback) => {
    const { imageUrl, estimatedAge, success, timestamp, userId } = data;
    db.query(
      'INSERT INTO age_verification_attempt (user_id, image_url, estimated_age, success, timestamp) VALUES (?, ?, ?, ?, ?)',
      [userId || null, imageUrl, estimatedAge, success, timestamp],
      callback
    );
  }
};

module.exports = AgeVerificationAttempt;