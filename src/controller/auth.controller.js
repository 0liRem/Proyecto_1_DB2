const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getDB } = require('../../CrDB');

const signToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

exports.register = async (req, res) => {
  try {
    const db = getDB();

    const { nombre, email, password, tipo, restauranteId } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      nombre,
      email,
      password: hashedPassword,
      tipo: tipo || 'usuario',
      restauranteId: restauranteId || null,
      fechaRegistro: new Date()
    };

    const result = await db.collection('usuarios').insertOne(newUser);

    const token = signToken(result.insertedId);

    res.status(201).json({
      status: 'success',
      token
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const db = getDB();

    const { email, password } = req.body;

    const user = await db.collection('usuarios').findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const correct = await bcrypt.compare(password, user.password);

    if (!correct) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};