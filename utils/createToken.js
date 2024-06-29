import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  try {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: '30d', 
    });

    // Set the token as a cookie
    res.cookie('jwt', token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV !== 'development', 
      sameSite: 'Strict',
      maxAge: 1000 * 60 * 60 * 24 * 30, 
    });

    console.log('Token generated and cookie set successfully.');
    return token;
  } catch (error) {
    console.error('Error generating token or setting cookie:', error);
    throw new Error('Token generation or setting cookie failed.');
  }
};

export default generateToken;
