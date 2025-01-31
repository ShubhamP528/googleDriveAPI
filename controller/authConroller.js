const User = require("../model/user");
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const createToken = (user) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
  return token;
};
exports.loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const token = createToken(user);
    res.json({
      message: "Login Successful",
      token,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
  // code for login functionality
};

exports.signupController = async (req, res) => {
  // code for signup functionality
  try {
    console.log(req.body);
    const { name, email, password } = req.body;
    const user = await User.findOne({ email });
    console.log(user);
    if (user) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    const token = createToken(newUser);

    res.json({
      message: "Signup Successful",
      token,
      name: newUser.name,
      email: newUser.email,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};
